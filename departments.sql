USE bamazon;
DROP TABLE departments;
CREATE TABLE departments (
    department_id int(10) AUTO_INCREMENT PRIMARY KEY,
    department_name varchar(50) DEFAULT "unknown department",
    overhead_costs int(10) DEFAULT 0
);

INSERT INTO departments (department_name)
SELECT DISTINCT department_name FROM products;

UPDATE departments SET overhead_costs = 12 WHERE department_name = "toys";
UPDATE departments SET overhead_costs = 30 WHERE department_name = "automotives";
UPDATE departments SET overhead_costs = 22 WHERE department_name = "appliances";
UPDATE departments SET overhead_costs = 9 WHERE department_name = "footwear";
UPDATE departments SET overhead_costs = 16 WHERE department_name = "food";


SELECT * FROM departments;