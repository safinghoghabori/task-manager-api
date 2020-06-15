/* [NOTE: THIS FILE IS SAME AS index.js BUT THIS FILE USING ASYNC/AWAIT AND ROUTER FROM SEPERATE FILE] */

const express = require("express");
require("./db/mongoose"); // We import this file only that it can ensure database is connected, we will not use it anywhere in the file.

// Import the router
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const app = express();

// // Create express middleware's function(THIS WILL COME FIRST ALWAYS,ORDER MUST BE MAINTAIN. NOTE: READ THIS AS LAST, NOT WHEN WE OPEN IT)
// app.use((req, res, next) => {
//   /*console.log(req.method, req.path);*/

//   if (req.method) {
//     res.status(503).send("Site is under maintainance...please try back later.");
//   }

//   // This function is compulsory to execute all route, otherwise no other route will get execute
//   // next();
// });

const port = process.env.PORT || 3000;

// Configure the express server to return data in JSON formate
app.use(express.json());

// Register the router
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`This is ${port} runnig...`);
});
