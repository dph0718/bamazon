USE bamazon;
CREATE TABLE IF NOT EXISTS products(
    product_name varchar(50),
    department_name varchar(50),
    price int(10),
    stock_quantity int (10),
    backorder int(10)
    
);

INSERT INTO products(product_name, department_name,price, stock_quantity, backorder)
VALUES
("rice", "food",	11,	4,	0),
("left shoe",	"footwear",	15,	23,	0),
("right shoe",	"footwear",	15,	20,	0),
("lamborghini diablo",	"automotives",	334484,	2,	0),
("light bulbs",	"appliances",	3,	100,	0),
("ambidextrous sock",	"footwear",	4,	53,	0),
("dryer",	"appliances",	342,	4,	0),
("keurig disposable cup guard",	"appliances",	1,	90,	0),
("chainsaw",	"toys",	33,	14,	0),
("banana",	"food",	1,	9,	0),
("blowtorch",	"toys",	4,	8,	0),
("Home Alone 2",	"footwear",	13,	4,	0),
("hyundai elantra",	"automotives",	12462,	3,	0)