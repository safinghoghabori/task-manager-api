/* [NOTE: THIS FILE IS SAME AS index.js BUT THIS FILE USING ASYNC/AWAIT INSTEAD OF PROMISES] */

const express = require("express");
require("./db/mongoose"); // We import this file only that it can ensure database is connected, we will not use it anywhere in the file.

const User = require("./models/user");
const Task = require("./models/task");

const app = express();

const port = process.env.PORT || 3000;

// Configure the express server to return data in JSON formate
app.use(express.json());

// Create users route
app.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read users with Model.find()
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read user with specific id using Model.findById()
app.get("/users/:id", async (req, res) => {
  // console.log(req.params);
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update the user with ids using findByIdAndUpdate()
app.patch("/users/:id", async (req, res) => {
  // Validation for not allowing the fileds to update/make update request that doesnt exist
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  // .every function returns bool, if all are matches then it will return true, otherwise false also if any one doesnt match then also it will return false
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const _id = req.params.id;
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete user by ids using findByIdAndDelete()
app.delete("/users/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create tasks route
app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read all tasks with Model.find()
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read task with ids using Model.findById()
app.get("/tasks/:id", async (req, res) => {
  _id = req.params.id;

  try {
    const task = await Task.findById(_id);
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update task by ids using findByIdAndUpdate()
app.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const _id = req.params.id;
    const task = await Task.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// Delete task by ids using findByIdAndDelete()
app.delete("/tasks/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findByIdAndDelete(_id);

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`This is ${port} runnig...`);
});
