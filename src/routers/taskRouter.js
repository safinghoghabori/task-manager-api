const express = require("express");

const Task = require("../models/task");
const auth = require("../middleware/auth");

// Make an instance of express.Route()
const router = new express.Router();

// Create tasks route
router.post("/tasks", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read all tasks with Model.find()
//[NOTE: We make fildtering here....to allow user to read spefic tasks]
router.get("/tasks", auth, async (req, res) => {
  try {
    // const tasks = await Task.find({}); <-----WITHOUT AUTHENTICATION

    /* We can also do without virtual field adding into user model and populate it, as follow*/
    // const tasks = await Task.find({owner: req.user._id})

    /* To read all tasks(WITHOUT FILTERING) */
    // await req.user.populate("tasks").execPopulate();

    /* To read tasks(WITH FILTERING) */
    const match = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true"; // we do this insted of directly assign the query string, bcuz query string is in String while we need Boolean
    }

    const sort = {};

    // GET tasks/sortBy=createdAt:desc
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    await req.user
      .populate({
        path: "tasks",
        match: match,
        options: {
          // For Pagination.......
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),

          //For Sorting.......
          sort: sort,
        },
      })
      .execPopulate();

    // res.send(tasks);
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read task with ids using Model.findById()
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // const task = await Task.findById(_id);  <-----WITHOUT AUTHENTICATION
    const task = await Task.findOne({ _id: _id, owner: req.user._id });

    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update task by ids using findByIdAndUpdate()
router.patch("/tasks/:id", auth, async (req, res) => {
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
    // SECOND LOGIC, otherwise same as below commented method
    /*const task = await Task.find(_id);  <-----WITHOUT AUTHENTICATION*/

    const task = await Task.findOne({ _id: _id, owner: req.user._id });
    // const task = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    if (!task) {
      res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// Delete task by ids using findByIdAndDelete()
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    // const task = await Task.findByIdAndDelete(_id);  <-----WITHOUT AUTHENTICATION

    const task = await Task.findOneAndDelete({ _id: _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
