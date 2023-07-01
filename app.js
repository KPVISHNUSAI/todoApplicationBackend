const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at http://localhost:3000/`);
    });
  } catch (error) {
    console.log(`Error DB: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API to create table name todo
app.post("/", async (request, response) => {
  const createTableQuery = `
        CREATE TABLE todo(
            id INTEGER,
            todo TEXT,
            priority TEXT,
            status TEXT
        );`;
  await db.run(createTableQuery);
});

//API 3
//Insert rows into the todo table
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addRowsQuery = `
        INSERT INTO todo (id,todo,priority,status)
        VALUES (${id},'${todo}','${priority}','${status}');
    `;
  await db.run(addRowsQuery);
  response.send("Todo Successfully Added");
});

//Get all info of the table
app.get("/", async (request, response) => {
  const getAllInfoQuery = `
        SELECT * FROM todo;
    `;
  const infoArray = await db.all(getAllInfoQuery);
  response.send(infoArray);
});

// API 1
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const applyFiltersQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%';`;
  const filteredArray = await db.all(applyFiltersQuery);
  response.send(filteredArray);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoByIdQuery = `
        SELECT * FROM todo WHERE id = ${todoId};`;
  const particularTodo = await db.get(getTodoByIdQuery);
  response.send(particularTodo);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM todo WHERE id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  let toUpdate = "";
  let field = "";
  switch (true) {
    case todo !== undefined:
      toUpdate = todo;
      field = "todo";
      break;
    case priority !== undefined:
      toUpdate = priority;
      field = "priority";
      break;
    case status !== undefined:
      toUpdate = status;
      field = "status";
      break;
    default:
      break;
  }

  const updateQuery = `UPDATE todo SET ${field} = '${toUpdate}' WHERE id = ${todoId}`;
  await db.run(updateQuery);
  let successMessage = "";
  switch (field) {
    case "todo":
      successMessage = "Todo Updated";
      break;
    case "priority":
      successMessage = "Priority Updated";
      break;
    case "status":
      successMessage = "Status Updated";
      break;
    default:
      break;
  }
  response.send(successMessage);
});

module.exports = app;
