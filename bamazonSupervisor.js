require("dotenv").config();

var inquirer = require("inquirer");
const chalk = require("chalk");
var mysql = require("mysql");
var keys = require("./keys.js");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.mysql.mysql_password,
    database: "bamazon_db"
});

//Display an offer sheet for the customer
connection.connect(function (err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`)
    supervisorView();
});

function supervisorView() {

    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "report",
            choices: ["View Product Sales by Department", "Add a New Department"]
        }
    ]).then(function (answer) {
        switch (answer.report) {
            case "View Product Sales by Department":
                viewSales();
                break;
            case "Add a New Department":
                newDepartment();
                break;
        }
    })
};

function viewSales() {
    connection.query("SELECT departments.department_id, departments.department_name, departments.overhead_costs, SUM(products.product_sales) AS product_sales, SUM(products.product_sales) - departments.overhead_costs AS total_profits FROM departments INNER JOIN products WHERE departments.department_name = products.department_name GROUP BY department_name", function (err, result) {
        console.table(result);
        console.log("-----------------------------------");
        connection.end();
    });
};

function newDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new department you would like to add?",
            name: "departmentName"
        },
        {
            type: "input",
            message: "What is its overhead cost?",
            name: "overhead",
            validate: function (input) {
                if (isNaN(input)) {
                    console.log(chalk.bold.red("Please enter a valid number"));
                } else {
                    return true;
                }
            }
        }
    ]).then(function (answer) {
        connection.query("INSERT INTO departments SET ?",
            {
                department_name: answer.departmentName,
                overhead_costs: answer.overhead,
            }, function (err) {
                if (err) throw err;
                console.log(chalk.bold.green("Your new department has been successfully added!"));
                connection.end();
            }
        );
    });
};