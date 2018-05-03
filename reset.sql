USE bamazon;
DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products(
    product_id int auto_increment primary key,
    product_name varchar(50) DEFAULT "unknown product",
    department_name varchar(50) DEFAULT "unknown department",
    price int(10) DEFAULT 0,
    stock_quantity int (10) DEFAULT 0,
    backorder int(10) DEFAULT 0,
    product_sales int(10) DEFAULT 0
);

INSERT INTO products(product_name, department_name,price, stock_quantity, backorder, product_sales)
VALUES
("rice", "food",	11,	4,	0, 0),
("left shoe",	"footwear",	15,	23,	0, 0),
("right shoe",	"footwear",	15,	20,	0, 0),
("lamborghini diablo",	"automotives",	334484,	2,	0, 0),
("light bulbs",	"appliances",	3,	100,	0, 0),
("ambidextrous sock",	"footwear",	4,	53,	0, 0),
("dryer",	"appliances",	342,	4,	0, 0),
("keurig disposable cup guard",	"appliances",	1,	90,	0, 0),
("chainsaw",	"toys",	33,	14,	0, 0),
("banana",	"food",	1,	9,	0, 0),
("blowtorch",	"toys",	4,	8,	0, 0),
("Home Alone 2 VHS",	"footwear",	13,	4,	0, 0),
("hyundai elantra",	"automotives",	12462,	3,	0, 0);

SELECT * FROM products;