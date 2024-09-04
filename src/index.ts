import inquirer from "inquirer";
import { pool } from "./db/connection.js";

function app() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?:",
            choices: [
                "View All Employees",
                "View All Departments",
                "View All Roles",
                "View Employees By Manager",
                "View Employees By Department",
                "Add Employee",
                "Add Role",
                "Add Department",
                "Update Employee Role",
                "Update Employee Manager",
                "Quit"
            ]
        }
    ]).then(({ action }) => {
        switch (action) {
            case "View All Employees":
                viewAllEmployees();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "View All Roles":
                viewAllRoles();
                break;
            case "Add Role":
                addRole();
                break;
            case "View All Departments":
                viewAllDepartments();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Quit":
                pool.end();
                break;
            case "Update Employee Manager":
                updateEmployeeManager();
                break;
            case "View Employees By Manager":
                viewEmployeesByManager();
                break;
            case "View Employees By Department":
                viewEmployeesByDepartment();
                break;
            default:
                console.log("Invalid Option");
                app();
                break;
        }
    });
}

async function viewAllEmployees(): Promise<void> {
    const sql = "SELECT employee.id, employee.first_name AS \"first name\", employee.last_name AS \"last name\", role.title, department.name AS department, role.salary, manager.first_name || ' ' || manager.last_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id;"
    const employees = await pool.query(sql);
    console.table(employees.rows);
    app();
}

async function viewAllDepartments(): Promise<void> {
    const sql = "SELECT * FROM department";
    const departments = await pool.query(sql);
    console.table(departments.rows);
    app();
}

async function viewAllRoles(): Promise<void> {
    const sql = "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id";
    const departments = await pool.query(sql);
    console.table(departments.rows);
    app();
}

async function addEmployee(): Promise<void> {
    const roles = await pool.query("SELECT id AS value, title AS name FROM role");
    const employees = await pool.query("SELECT id AS value, first_name || ' ' || last_name AS name FROM employee");
    inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "Enter the employee's first name:"
        },
        {
            type: "input",
            name: "last_name",
            message: "Enter the employee's last name:"
        },
        {
            type: "list",
            name: "role_id",
            message: "Enter the employee's role:",
            choices: roles.rows
        },
        {
            type: "list",
            name: "manager_id",
            message: "Enter the employee's manager:",
            choices: employees.rows
        }
    ]).then(({ first_name, last_name, role_id, manager_id }) => {
        pool.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)", [first_name, last_name, role_id, manager_id], (err: Error) => {
            if (err) throw err;
            console.log("Employee added")
            app();
        })
    });
}

async function updateEmployeeRole(): Promise<void> {
    const roles = await pool.query("SELECT id AS value , title AS name FROM role");
    const employees = await pool.query("SELECT id AS value, first_name || ' ' || last_name AS name FROM employee");
    inquirer.prompt([
        {
            type: "list",
            name: "employee_id",
            message: "Select the employee to update:",
            choices: employees.rows
        },
        {
            type: "list",
            name: "role_id",
            message: "Select the employee's new role:",
            choices: roles.rows
        }
    ]).then(async ({ employee_id, role_id }) => {
        await pool.query("UPDATE employee SET role_id = $1 where id = $2", [role_id, employee_id]);
        console.log("Employee role updated");
        app();
    });
}

async function addRole(): Promise<void> {
    const departments = await pool.query("SELECT id as value, name as name FROM department");
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Enter the role title:"
        },
        {
            type: "input",
            name: "salary",
            message: "Enter the role salary:"
        },
        {
            type: "list",
            name: "department_id",
            message: "Enter the department:",
            choices: departments.rows
        },
    ]).then(async ({ title, salary, department_id }) => {
        await pool.query("INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)", [title, salary, department_id]);
        console.log("Role added");
        app();
    });
}

async function addDepartment(): Promise<void> {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter the department name:"
        },
    ]).then(async ({ name }) => {
        await pool.query("INSERT INTO department (name) VALUES ($1)", [name]);
        console.log("Department added");
        app();
    });
}

// Bonus Functions
async function updateEmployeeManager(): Promise<void> {
    const employees = await pool.query("SELECT id AS value, first_name || ' ' || last_name AS name FROM employee");
    inquirer.prompt([
        {
            type: "list",
            name: "employee_id",
            message: "Select the employee to update:",
            choices: employees.rows
        },
        {
            type: "list",
            name: "manager_id",
            message: "Select the employee's new manager:",
            choices: employees.rows
        }
    ]).then(async ({ employee_id, manager_id }) => {
        if (employee_id !== manager_id) {
            await pool.query("UPDATE employee SET manager_id = $1 where id = $2", [manager_id, employee_id]);
            console.log("Employee role updated");
        } else {
            console.log("Invalid manager selection");
        }
        app();
    });
}

async function viewEmployeesByManager(): Promise<void> {
    const employees = await pool.query("SELECT id AS value, first_name || ' ' || last_name AS name FROM employee");
    inquirer.prompt([
        {
            type: "list",
            name: "manager_id",
            message: "Select the manager whose employees you want to view:",
            choices: employees.rows
        },
    ]).then(async ({ manager_id }) => {
        const sql = "SELECT employee.id, employee.first_name AS \"first name\", employee.last_name AS \"last name\", role.title, department.name AS department, role.salary, manager.first_name || ' ' || manager.last_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id WHERE employee.manager_id = $1;"
        const manager_employees = await pool.query(sql, [manager_id]);
        console.table(manager_employees.rows);
        app();
    });
}

async function viewEmployeesByDepartment(): Promise<void> {
    const departments = await pool.query("SELECT id as value, name as name FROM department");
    inquirer.prompt([
        {
            type: "list",
            name: "name",
            message: "Select the department of the employees you want to view:",
            choices: departments.rows
        },
    ]).then(async ({ name }) => {
        const sql = "SELECT employee.id, employee.first_name AS \"first name\", employee.last_name AS \"last name\", role.title, department.name AS department, role.salary, manager.first_name || ' ' || manager.last_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id WHERE role.department_id = $1;"
        const department_employees = await pool.query(sql, [name]);
        console.table(department_employees.rows);
        app();
    });
}

app();