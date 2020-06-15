const mongoose = require("mongoose");

// Connect with mongodb (here "/task-manager-api" is database name)
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true, //this is only for removing the warning msg in console
  useFindAndModify: false, //this is only for removing the warning msg in console
});

// .
// .
// .
// .
// .
// .
// .
// CHALLENGE: Create new model task (THIS IS FOR DEMONSTRATION/REFERENCE PURPOSE ONLY.....We can create model in same file or seperatoly too)
/*const Task = mongoose.model("Task", {
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
  },
});

// Create instance of the model
const work = new Task({
  description: "Buy milk",
  completed: true,
});

// Save document to the database
work
  .save()
  .then((res) => console.log(res))
  .catch((error) => console.log(error));*/
