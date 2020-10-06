var mysql = require("mysql");
var cTable = require("console.table");
var inquirer = require(`inquirer`);
var figlet = require("figlet");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "thiPPu8!op",
  database: "employee_tracker",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  figlet("Employee Manager!", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
    //   call first function
    initiate();
  });
});

const initiate = () => {
  // console.table([employeeData])
  inquirer
    .prompt([
      {
        name: "menuChoice",
        type: "list",
        choices: [
          "View ALL Employees",
          "View ALL roles",
          "View ALL departments",
          "Add Employee",
          "Add department",
          "Add role",
          "Update Employee Role",
          "Remove Employee",
          "Exit",
        ],
        message: "What would you like to do?",
      },
    ])
    .then(({ menuChoice }) => {
      switch (menuChoice) {
        case "View ALL Employees":
          viewEmployees();
          break;
        case "View ALL roles":
          viewRoles();
          break;
        case "View ALL departments":
          viewDepartment();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Add role":
          addRole();
          break;
        case "Update Employee Role":
          updateRole();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "Exit":
          connection.end();
      }
    });
};

const viewEmployees = () => {
  connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, role.id AS role_id, role.salary, department.name AS department, department.id AS department_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id",
    function (err, employeeData) {
      if (err) console.log(err);
      console.table(employeeData);
      initiate();
    }
  );
};

const viewRoles = () => {
  connection.query("SELECT * FROM role", function (err, roleData) {
    if (err) console.log(err);
    console.table(roleData);
    initiate();
  });
};

const viewDepartment = () => {
  connection.query("SELECT * FROM department", function (err, departmentData) {
    if (err) console.log(err);
    console.table(departmentData);
    initiate();
  });
};

const addEmployee = () => {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter employee's first name",
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter employee's last name",
      },
      {
        name: "roleId",
        type: "input",
        message: "Enter employee's roleId",
      },
    ])
    .then(function (employeeInfo) {
      connection.query(
        `INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);`,
        [employeeInfo.firstName, employeeInfo.lastName, employeeInfo.roleId],
        function (err, employeeData) {
          if (err) {
            console.log(err);
            connection.end();
          } else {
            console.log("Employee was successfully added!");
            initiate();
          }
        }
      );
    });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "departmentName",
        type: "input",
        message: "Enter department you wish to add",
      },
    ])
    .then(function (departmentInfo) {
      connection.query(
        `INSERT INTO department (name) VALUE (?);`,
        departmentInfo.departmentName,
        function (err, employeeData) {
          if (err) console.log(err);
          console.log("Department was successfully added!");
          initiate();
        }
      );
    });
};

const addRole = () => {
  inquirer
    .prompt([
      {
        name: "roleTitle",
        type: "input",
        message: "Enter role you wish to add.",
      },
      {
        name: "roleSalary",
        type: "input",
        message: "Enter the salary of that role.",
      },
      {
        name: "roleDepartment",
        type: "input",
        message: "Enter the department ID of that role.",
      },
    ])
    .then(function (roleInfo) {
      connection.query(
        `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`,
        [roleInfo.roleTitle, roleInfo.roleSalary, roleInfo.roleDepartment],
        function (err, employeeData) {
          if (err) {
            console.log(err);
            connection.end();
          } else {
            console.log("Role was successfully added!");
            initiate();
          }
        }
      );
    });
};

const updateRole = () => {
  connection.query("SELECT * FROM employee", function (err, employeeData) {
    if (err) {
      console.log(err);
    } else {
      let choices = employeeData.map((employee) => ({
        value: employee.id,
        name: `${employee.last_name}, ${employee.first_name}`,
      }));

      inquirer
        .prompt([
          {
            name: "selectEmployee",
            type: "list",
            choices: choices,
            message: "Select from your list of employees",
          },
          {
            name: "updateRole",
            type: "input",
            message: "What role id would you like to change to?",
          },
        ])
        .then(function (choice) {
          console.log(choice);
          connection.query(
            `UPDATE employee SET role_id = ${choice.updateRole} WHERE id = ${choice.selectEmployee}`,
            function (err) {
              if (err) console.log(err);
              console.log(choice);
              console.log("Role was Updated");
              initiate();
            }
          );
        });
    }
  });
};

const removeEmployee = () => {
  connection.query("SELECT * FROM employee", function (err, employeeData) {
    if (err) {
      console.log(err);
    } else {
      let choices = employeeData.map((employee) => ({
        value: employee.id,
        name: `${employee.last_name}, ${employee.first_name}`,
      }));

      inquirer
        .prompt([
          {
            name: "selectEmployee",
            type: "list",
            choices: choices,
            message: "Select from your list of employees",
          },
        ])
        .then(function (choice) {
          console.log(choice);
          connection.query(
            `DELETE FROM employee WHERE id = ${choice.selectEmployee}`,
            function (err) {
              if (err) console.log(err);
              console.log(choice);
              console.log("Employee was removed");
              initiate();
            }
          );
        });
    }
  });
};
