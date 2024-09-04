\c employees_db

INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES 
('Sales Associate', 50000, 1),
('Software', 80000, 2),
('Accountant', 55000, 3),
('Paralegal', 90000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Sam', 'Simmons', 4, NULL),
('Jacob', 'Dumaine', 3, NULL),
('Adam', 'Park', 1, NULL),
('Tyler', 'Williams', 2, NULL);