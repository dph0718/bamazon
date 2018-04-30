require('dotenv').config();
const mysql = require("mysql");
const inquirer = require('inquirer');
const pluralize = require('pluralize');
const Table = require('easy-table');
let numAvailable;
let price;
function waitASec(fx) {
    setTimeout(function () { fx() }, 1000);
}



const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "bamazon"
});

//Makes the connection and begins offering the manager choices. 
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    managerChoices();
});

//offers the manager some choices.
function managerChoices() {
    inquirer.prompt({
        name: 'firstChoice',
        message: 'Hi, manager. What would you like to do?',
        type: 'list',
        choices: [
            {
                name: "View all products",
                value: 0
            },
            {
                name: "View low inventory",
                value: 1
            },
            {
                name: "Add to inventory",
                value: 2
            },
            {
                name: "Add new product",
                value: 3
            },
            {
                name: 'Quit',
                value: 4
            }
        ]
    })
        .then(res => {
            let resp = res.firstChoice;
            if (resp == 0) {
                viewProducts();
            } else if (resp == 1) {
                lowInventory();
            } else if (resp == 2) {
                addInventory();
            } else if (resp == 3) {
                addNewProduct();
            } else if (resp == 4){
                console.log("Goodbye, Manager. Good luck with your managing.")
                waitASec(process.exit)
            }
        })

}

//views all products in a table
function viewProducts() {
    console.log('all products.');
    connection.query(`SELECT item_id, product_name, price, stock_quantity FROM products`, function (err, res) {
        let data = [];
        res.forEach(i => data.push(i));
        let t = new Table;
        data.forEach(function (product) {
            t.cell('Product Id', product.item_id)
            t.cell('Product Name', product.product_name)
            t.cell('Stock', product.stock_quantity)
            t.cell('Price, USD', product.price, Table.number(2))
            t.newRow()
        })
        console.log(t.toString());
    })
    waitASec(managerChoices);
}

//shows all inventory items with an inventory < 5
function lowInventory() {
    connection.query(`SELECT item_id, product_name, stock_quantity FROM products`, function (err, res) {
        let data = [];
        res.forEach(i => {
            if (i.stock_quantity < 5) { data.push(i) };
        });
        let t = new Table;
        data.forEach(function (product) {
            t.cell('Product Id', product.item_id)
            t.cell('Product Name', product.product_name)
            t.cell('Stock', product.stock_quantity)
            t.newRow()
        })
        console.log(t.toString());
    })
    waitASec(managerChoices);
}

//increases (or decreases) stock quantity of an item
function addInventory() {
    let inv = [];
    connection.query(`SELECT item_id, product_name FROM products`, function (err, res) {
        res.forEach(i => {
            inv.push(i.product_name)
        })
        inquirer.prompt([
            {
                name: 'add',
                message: 'Which item would you like to add more of?',
                type: 'list',
                choices: inv
            },
            {
                name: 'amount',
                message: 'How many items are you adding to the inventory?',
                type: 'input'
            }
        ]).then(res => {
            let stock;
            let amount = parseFloat(res.amount);
            if (typeof (amount) == 'number' && amount > 0 && amount % 1 === 0) {
                connection.query(`SELECT stock_quantity FROM products WHERE product_name = "${res.add}"`, function (err, resp) {
                    stock = parseInt(resp[0].stock_quantity);
                    connection.query(`UPDATE products SET stock_quantity = ${stock + amount} WHERE product_name = "${res.add}"`);
                    console.log(`You have successfully added ${amount} to the ${res.add} quantity, for a total of ${stock + amount} items.`)
                    waitASec(managerChoices);
                });
            }
            else {
                console.log("That is not an appropriate amount.");
                waitASec(addInventory);
            }
        })
    })
};

//adds a new product, its price, quantity, and department into the database
function addNewProduct() {
    inquirer.prompt([
        {
            name: 'name',
            message: 'What product are you adding to the inventory?',
            type: 'input'
        },
        {
            name: 'price',
            message: 'What is the price per unit?',
            type: 'input'
        },
        {
            name: 'quantity',
            message: 'How many are you adding to the inventory?',
            type: 'input'
        },
        {
            name: 'department',
            message: 'What department will this go in?',
            type: 'input'
        }
    ])
        .then(res => {
            connection.query(`INSERT INTO products (product_name, price, department_name, stock_quantity) VALUE('${res.name}','${res.price}','${res.department}','${res.quantity}')`);
            console.log(`You have successfully added ${res.quantity} ${pluralize(res.name)} to the inventory of the ${res.department} department!`);
            waitASec(managerChoices);
        })
}