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

connection.connect(function (err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`)
    managerView();
});

function managerView() {

    inquirer.prompt([
        {
            type: "list",
            message: "Which report would you like to run?",
            name: "report",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (answer) {
        switch (answer.report) {
            case "View Products for Sale":
                offer();
                break;
            case "View Low Inventory":
                lowInventory();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                newProduct();
                break;
        }
    })
}

function offer() {
    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        console.table(result);
        console.log("-----------------------------------");
        connection.end();
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 10", function (err, result) {
        if (err) throw err;
        console.table(result);
        console.log("-----------------------------------");
        connection.end();
    });
}
function addInventory() {
    var itemArrNumber;
    connection.query("SELECT item_id, product_name, stock_quantity FROM products", function (err, result) {
        console.table(result);
        console.log("-----------------------------------");

        inquirer.prompt([
            {
                type: "input",
                message: "What is the ID of the item you would like to add?",
                name: "item",
                validate: function (input) {
                    var idTest = false;
                    for (var i = 0; i < result.length; i++) {
                        if (parseInt(input) === parseInt(result[i].item_id)) {
                            idTest = true;
                            itemArrNumber = i;
                            break;
                        }
                    }
                    if (idTest === true) {
                        return idTest;
                    } else {
                        console.log(chalk.bold.red("\n\nPlease choose from the list of IDs displayed\n"));
                    }
                }
            },
            {
                type: "input",
                message: "How many would you like to add?",
                name: "added"
            }
        ]).then(function (answer) {
            var newTotal = parseInt(result[itemArrNumber].stock_quantity) + parseInt(answer.added);
            connection.query("UPDATE products SET ? WHERE ?", [
                {
                    stock_quantity: newTotal
                },
                {
                    item_id: answer.item
                }
            ], function (err) {
                if (err) throw err;
                console.log(`${answer.added} ${result[itemArrNumber].product_name} have been to your inventory for a new total of ${newTotal}`);
                console.log("-----------------------------------");
                connection.end();
            });
        })

    })

}

function newProduct() {
    connection.query("SELECT department_name FROM departments", function (error, result) {
        console.table(result);
        inquirer.prompt([
            {
                type: "input",
                message: "What is the name of the new product you would like to add?",
                name: "productName"
            },
            {
                type: "input",
                message: "To which department?",
                name: "department",
                validate: function (input) {
                    var test = false;
                    for (var i = 0; i < result.length; i++) {
                        if (input === result[i].department_name) {
                            test = true;
                            break;
                        }
                    }
                    if (test === false) {
                        console.log(chalk.bold.red("\nThis department does not exist, please enter a valid department"));
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                message: "What is this product price?",
                name: "price",
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log(chalk.bold.red("\nPlease enter a valid price"));
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                message: "How many would you like to add?",
                name: "quantity",
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log(chalk.bold.red("\nPlease enter a valid quantity"));
                    } else {
                        return true;
                    }
                }
            }
        ]).then(function (answer) {
            connection.query("INSERT INTO products SET ?",
                {
                    product_name: answer.productName,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.quantity
                }, function (err) {
                    if (err) throw err;
                    console.log(chalk.bold.green("Your product has been successfully added!"));
                    connection.end();
                }
            )
        })
    })
}