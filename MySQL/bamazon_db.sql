DROP DATABASE bamazon_db;
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
item_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT
, product_name VARCHAR(50) NOT NULL
, department_name VARCHAR(30) NOT NULL
, price FLOAT(10,2) NOT NULL
, stock_quantity INTEGER(10) NOT NULL
, product_sales FLOAT (10,2) DEFAULT 0
);

CREATE TABLE departments (
department_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT
, department_name VARCHAR(30) NOT NULL
, overhead_costs FLOAT(10,2)
);

INSERT INTO departments (
department_name
, overhead_costs
)
VALUES (
'condiments'
, 50
),
(
'bread'
, 30
),
(
'drinks'
, 50
),
(
'paper products'
,20
),
(
'meats'
, 70
),
(
'snacks'
, 25
);


INSERT INTO products (
product_name
, department_name
, price
, stock_quantity
)
VALUES (
'peanut butter'
,'condiments'
, 1.99
,  20
),
(
'strawberry jam'
, 'condiments'
, 2.49
, 35
),
(
'slice bread'
, 'bread'
,0.99
,30
),
(
'hot dog buns'
, 'bread'
, 1.49
, 15
),
(
'hamburger buns'
,'bread'
,1.49
,20
),
(
'bottle water'
, 'drinks'
, 0.75
,40
),
(
'diet coke'
, 'drinks'
,1.19
,10
),
(
'coke zero'
, 'drinks'
, 1.19
, 5
),
(
'toilet paper'
, 'paper products'
, 0.69
, 20
),
(
'paper towels'
, 'paper products'
, 0.99
,7
),
(
'hot dogs'
, 'meats'
, 2.99
, 9
),
(
'turkey breast'
, 'meats'
, 4.99
, 10
),
(
'salmon'
, 'meats'
, 7.69
, 3
);

SELECT * FROM products;

