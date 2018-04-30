require('dotenv').config();
const mysql = require("mysql");
const inquirer = require('inquirer');
const pluralize = require('pluralize');
let choice;
let custQuant;
let numAvailable;
let price;

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: process.env.DB_USER,

    // Your password
    password: process.env.DB_PASSWORD,
    database: "bamazon"
});


//Makes the connection and begins the product ordering
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    productsDisp();
});

//makes a list of the available products, user chooses from that list, displays price then calls purchase prompt function
function productsDisp() {
    connection.query("SELECT product_name FROM products", function (err, res) {
        if (err) throw err;
        productArray = [];
        for (let i = 0; i < res.length; i++) {
            productArray.push(res[i].product_name);
        };
        inquirer.prompt({
            name: 'products',
            type: 'list',
            message: 'What product are you interested in?',
            choices: productArray,
        })
            .then(function (res) {
                choice = res.products;
                connection.query(`SELECT price FROM products WHERE product_name = "${choice}"`, function (err, res) {
                    if (err) throw err;
                    price = res[0].price;
                    let upperChoice = choice.replace(/^\w/, function (chr) {
                        return chr.toUpperCase();
                      });
                    console.log(`${pluralize(upperChoice)} cost $${price} per unit.`);
                    purchase();
                })
            })
    });
};

//prompts user to buy. If they no buy, back to products display. If buy, calls specify amount function
function purchase() {
    inquirer.prompt({
        name: 'buy',
        message: `Would you like to purchase any ${pluralize(choice)}?`,
        type: 'confirm'
    })
        .then(function (r) {
            if (r.buy) {
                specQuantity();
            }
            else productsDisp();
        })

}

//user sets quantity. sanitizes input. & calls checkQuantity.
function specQuantity() {
    inquirer.prompt({
        name: 'quantity',
        message: `How many ${pluralize(choice)} would you like to buy?`,
        type: 'input'
    })
        .then(function (r) {
            let amount = parseFloat(r.quantity);
            if (typeof (amount) == 'number' && amount > 0 && amount % 1 === 0) {
                checkQuantity();
                custQuant = amount;
            }
            else {
                console.log("That is not an appropriate amount.");
                specQuantity();
            }
        })
}

//Checks the stock_quantity & revisesQuant, otherwise confirmsQuant
function checkQuantity() {
    connection.query(`SELECT stock_quantity FROM products WHERE product_name = "${choice}"`, function (err, res) {
        numAvailable = res[0].stock_quantity;
        if (custQuant > numAvailable) {
            console.log(`Sorry, there are only ${numAvailable} ${pluralize(choice)} available.`);
            reviseQuant(numAvailable);
        }
        else {
            inquirer.prompt({
                name: 'sure',
                message: `You've placed an order for ${custQuant} ${pluralize(choice)}. 
                \n The total price is $${custQuant * price}. 
                \n Is this correct?`,
                type: 'confirm'
            }).then(res => {
                if (res.sure) {
                    confirmQuant();
                } else {
                    specQuantity();
                }

            })
        }
    })
}

//revisesQuantity according to the numAvailable and 
function reviseQuant(x) {
    inquirer.prompt({
        name: 'revise',
        type: 'confirm',
        message: `Would you like to order ${x} ${pluralize(choice)} instead?`
    })
        .then(r => {
            if (r.revise) {
                console.log(r)
                confirmQuant();
            } else {
                backOrder();
            }
        })
}

//gives the user the option to tell us at Bamazon to place the remainder of items on backorder
function backOrder() {
    let lackingItems = (custQuant - numAvailable);
    console.log(`Lacking items: ${lackingItems}`)
    inquirer.prompt({
        name: 'backorder',
        message: `Would you like to order the ${numAvailable} ${pluralize(choice)} in stock and place the remaining ${lackingItems} ${pluralize(choice)} on backorder?`,
        type: 'confirm',
    })
        .then(r => {
            if (r.backorder) {
                reqBackOrder(lackingItems);
            } else {
                changeOrExit();
            }
        })
}

//sends backorder information, retrieves & updates backorder amounts
function reqBackOrder(y) {
    connection.query(`SELECT backorder FROM products WHERE product_name = "${choice}"`, function (err, r) {
        connection.query(`UPDATE products SET stock_quantity = 0 WHERE product_name = "${choice}"`);
        connection.query(`UPDATE products SET backorder = ${r[0].backorder + y} WHERE product_name = "${choice}"`);

    })
    confirmQuant();

};

function changeOrExit() {
    inquirer.prompt({
        name: 'change',
        message: `Would you like to change or cancel your order ? `,
        type: 'list',
        choices: ['change', 'cancel']
    })
        .then(r => {
            if (r.change == "change") {
                specQuantity();
            } else if (r.change == "cancel") {
                console.log(`We're sorry we can't provide you with your required number of ${pluralize(choice)}. 
                \nWe hope you'll find what you need!`);
                setTimeout(function () { productsDisp() }, 2000);
            }
        })
}

//confirms the quantity and places order.
function confirmQuant() {
    let remainingStock = numAvailable - custQuant;
    if (remainingStock > 0) {
        connection.query(`UPDATE products SET stock_quantity = ${remainingStock} WHERE product_name = "${choice}"`);
    } else {
        connection.query(`UPDATE products SET stock_quantity = 0 WHERE product_name = "${choice}"`);
    }
    connection.query(`SELECT stock_quantity FROM products WHERE product_name = "${choice}"`, function (err, r) {
        console.log(`Your order of ${custQuant} ${pluralize(choice)} has been placed! There are ${r[0].stock_quantity} ${pluralize(choice)} left in stock.`)
        inquirer.prompt({
            name: 'another',
            message: 'Would you like to place another order?',
            type: 'confirm',
        })
            .then(res => {
                if (res.another) {
                    productsDisp();
                } else {
                    console.log(`Thanks for your order! We'll email you with delivery details.`);
                    setTimeout(function () { process.exit() }, 1200);
                }
            })
    })
};