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
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 10", function (err, result) {
        if (err) throw err;
        console.table(result);
        console.log("-----------------------------------");
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
                        console.log("\n\nPlease choose from the list of IDs displayed\n")
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
            });
        })

    })

}

function newProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new product you would like to add?",
            name: "productName"
        },
        {
            type: "input",
            message: "To which department?",
            name: "department"
        },
        {
            type: "input",
            message: "What is this product price?",
            name: "price"
        },
        {
            type: "input",
            message: "How many would you like to add?",
            name: "quantity"
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
                console.log("Your product has been successfully added!");
            }
        )
    })
}