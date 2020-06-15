const express = require("express");
require("./db/mongoose"); // We import this file only that it can ensure database is connected, we will not use it anywhere in the file.

const User = require("./models/user");
const Task = require("./models/task");

const app = express();

const port = process.env.PORT || 3000;

// Configure the express server to return data in JSON formate
app.use(express.json());

// Create users route
app.post("/users", (req, res) => {
  const user = new User(req.body);

  user
    .save()
    .then(() => {
      //[NOTE: Here we are sending status code with response, bcuz by default it sets 200 which means "ok", b ut we want to make more specific status code so. Btw it is not mandatory.]
      res.status(201).send(user);
    })
    .catch((error) => {
      //   res.status(400);
      //   res.send(error); WE CAN ALSO MAKE CHAINING
      res.status(400).send(error);
    });
});

// Read users with Model.find()
app.get("/users", (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      res.status(500).send();
    });
});

// Read user with specific id using Model.findById()
app.get("/users/:id", (req, res) => {
  // console.log(req.params);
  const _id = req.params.id;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send(user);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Create tasks route
app.post("/tasks", (req, res) => {
  const task = new Task(req.body);

  task
    .save()
    .then(() => {
      res.status(201).send(task);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

// Read all tasks with Model.find()
app.get("/tasks", (req, res) => {
  Task.find({})
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Read task with ids using Model.findById()
app.get("/tasks/:id", (req, res) => {
  _id = req.params.id;
  Task.findById(_id)
    .then((task) => {
      if (!task) {
        return res.status(404).send();
      }
      res.send(task);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.listen(port, () => {
  console.log(`This is ${port} runnig...`);
});
