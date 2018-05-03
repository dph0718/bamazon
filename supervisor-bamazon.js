require('dotenv').config();
const mysql = require("mysql");
const inquirer = require('inquirer');
const pluralize = require('pluralize');
const Table = require('easy-table');
let numAvailable;
let price;

//abstracts away about 22 characters from the 1-second timeout function.
function waitASec(fx) {
    setTimeout(function () { fx() }, 1000);
}

const connection = mysql.createConnection({
    host: "localhost",
    port: process.env.PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "bamazon"
});

//Makes the connection and begins offering the manager choices. 
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    supervisorChoices();
});

function supervisorChoices() {
    inquirer.prompt({
        name: 'choice',
        message: "Hello, Supervisor. What would you like to do?",
        type: 'list',
        choices: [
            {
                name: "View Product Sales by Department",
                value: 0
            },
            {
                name: "Create New Department",
                value: 1
            }, {
                name: "Quit",
                value: 2
            }
        ]
    }).then(res => {
        if (res.choice == 0) {
            viewSales();
        } else if (res.choice == 1) {
            newDept();
        } else if (res.choice == 2) {
            console.log("Alright. Keep it super.");
            waitASec(process.exit);
        }
    })
}

function viewSales() {
    let depts = [];
    let data = [];
    connection.query(`SELECT department_name FROM departments;`, function (err, res) {
        res.forEach(i => depts.push(i.department_name));
        depts.forEach(j => {
            connection.query(`SELECT department_name, SUM(product_sales) AS total, overhead_costs FROM(
        (SELECT d.department_name, p.product_sales, d.department_id, d.overhead_costs
        FROM departments AS d, products AS p
        WHERE p.department_name = '${j}'
        AND d.department_name = p.department_name)
        )
        AS alias;`, function (err, res) {
                    res.forEach(i => data.push(i));
                    if (data.length == depts.length) {
                        let t = new Table;
                        data.forEach(function (ret) {
                            t.cell('Department', ret.department_name)
                            t.cell('Revenue', (ret.total - ret.overhead_costs), Table.number(2))
                            t.newRow()
                        })
                        console.log(t.toString());
                        waitASec(supervisorChoices);
                    }
                })
        })
    })
}

function newDept() {
    inquirer.prompt([
        {
            name: 'department',
            type: 'input',
            message: "What department would you like to add?"
        },
        {
            name: 'overhead',
            type: 'input',
            message: "Please provide an estimate for overhead costs."
        }
    ]).then(r => {
        let ohead = parseInt(r.overhead);
        if (ohead >= 0) {
            connection.query(`INSERT INTO departments (department_name, overhead_costs)
        VALUE ("${r.department}", ${r.overhead});`)
        connection.query(`INSERT INTO products (product_name, department_name)
        VALUE ("dummy item", "${r.department}");`)
        
            console.log(`${r.department} has successfully been added!`);
            waitASec(supervisorChoices);
        } else {
            console.log('The estimate you provided is not valid.');
            newDept();
        }
    })
}