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
    offer();
});

function offer() {
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, result) {
        console.table(result);
        console.log("-----------------------------------");
        userRequest();
    });
}

var purchaseValue = 0;
function userRequest() {

    connection.query("SELECT * FROM products", function (err, result) {
        var itemArrNumber = 0;

        inquirer.prompt([
            {
                type: "input",
                message: "What is the ID of the item you would like to buy? [0 to quit]",
                name: "purchaseID",
                validate: function (input) {
                    if (parseInt(input) === 0) {
                        var idTest = true;
                    } else {
                        var idTest = false;
                        for (var i = 0; i < result.length; i++) {
                            if (parseInt(input) === parseInt(result[i].item_id)) {
                                idTest = true;
                                itemArrNumber = i;
                                break;
                            }
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
                message: "How many would you like to buy? [0 to quit]",
                name: "quantity",
                validate: function (input) {
                    if (parseInt(input) <= parseInt(result[itemArrNumber].stock_quantity)) {
                        return true;
                    } else {
                        console.log(chalk.bold.red("\n\nWe don't have enough in stock, please pick a different quantity\n"));
                    }
                }
            }]).then(function (answer) {
                if (parseInt(answer.purchaseID) === 0) {
                    console.log(chalk.bold.green(`Thank you for your purchase, you owe ${purchaseValue.toFixed(2)} dollars.`));
                    connection.end();
                } else {
                    var quantityRemain = parseInt(result[itemArrNumber].stock_quantity) - parseInt(answer.quantity);
                    var itemValue = parseInt(answer.quantity) * parseFloat(result[itemArrNumber].price)
                    purchaseValue = purchaseValue + itemValue;
                    updateInventory(quantityRemain, answer.purchaseID, itemValue, parseFloat(result[itemArrNumber].product_sales));
                    // console.log(purchaseValue);
                    userRequest();
                }
            })
    })
}


function updateInventory(remains, item, itemValue, productSales) {
    var totalProductSales = productSales + itemValue;
    var query = connection.query("UPDATE products SET ? WHERE ?", [
        {
            stock_quantity: remains,
            product_sales: totalProductSales
        },
        {
            item_id: item
        }
    ], function (err, res) {
        if (err) throw err;
        // console.log(`${res.affectedRows} product updated!\n`);
    });

}

