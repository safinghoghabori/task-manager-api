const express = require("express");
const multer = require("multer"); // File uploading
const sharp = require("sharp"); // Image resize, formatting etc

const User = require("../models/user");
const auth = require("../middleware/auth");

// Make an instance of express.Router
const router = new express.Router();

// Create users route(WITH CHANGE, FROM "app" TO "router")
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

// User login router
router.post("/users/login", async (req, res) => {
  try {
    // findByCredentials() is a UDF
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    // call generateAuthToken(),which is UDF func too
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// User logout router(for single account logout)
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// User logout router(from all accounts)
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(200).send();
  }
});

// Read users with Model.find()
// [NOTE: auth is an second arg to pass in any route as a middleware. It will run first than async func, and if it has next() then n then this function will run otherwise not]
// [CHANGED: /users to /users/me bcuz we want to allow authenticated user to see only their data, not all]
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user); // we already stored "user" from "auth.js",so we no longer need to find it here....check
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (error) {
  //   res.status(500).send(error);
  // }
});

// Read user with specific id using Model.findById() [WE NO LONGER NEED THIS, BCUZ WE ARE FETCHING SPECIFIC USER WITH ID]
// router.get("/users/:id", async (req, res) => {
//   // console.log(req.params);
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);
//     res.send(user);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// Update the user with ids using findByIdAndUpdate()
// CHANGED: router.patch("/users/:id", async (req, res) => {
router.patch("/users/me", auth, async (req, res) => {
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
    /*const _id = req.params.id;*/

    // WE DOING THIS BCUZ WE WANT TO RUN userSchema.pre(), when user updates the password(for more read REST API notes...)
    /*const user = await User.findById(_id);*/

    // We cant know what user will update, so we iterate through updates arr of str
    updates.forEach((update) => {
      //here we use "brackete notation", so we can dynamically update the changes as user pass into the body
      /*user[update] = req.body[update];*/
      req.user[update] = req.body[update];
    });
    await req.user.save();

    // const user = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // if (!user) {
    //   return res.status(404).send();
    // }
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete user by id using findByIdAndDelete()[WE MAKE CHANGES HERE AND USE AUTH FOR AUTHENTICATION]
// router.delete("/users/:id", async (req, res) => {
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const _id = req.params.id;
    // const user = await User.findByIdAndDelete(_id);

    // if (!user) {
    //   return res.status(404).send();
    // }
    console.log("1...", req.user);
    await req.user.remove();
    console.log("2...", req.user);
    console.log("not working..");
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// File Uploading
const upload = multer({
  /*dest: "avatar", Where to store the files, i.e. destination*/ //CHANGED: We are storing image on server, rather than in folder
  limits: {
    fileSize: 1000000, // limit file size, accepts bytes. 1MB = 1M
  },
  // Function to control which files are accepted(file=contains the all info of the file, goto docs for more. "cb" = callback function. ".endsWith"= this method will check if the filename ends with specified string)
  fileFilter(req, file, cb) {
    if (
      // !file.originalname.endsWith(".jpg") We can use RegEx too
      !file.originalname.match(/\.(jpg|jpeg|png)$/)
    ) {
      return cb(new Error("File must be in JPG,JPEG or PNG formate"));
    }
    cb(undefined, true); // This is pattern of passing success into callback function in this multer
  },
});

// Create avatar route
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // req.user.avatar = req.file.buffer; (WITHOUT "SHARP" FILTERING)

    // Formatting an image
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  // We pass 4th argument to handle the error(especially convert the HTML formatted error into JSON like error)
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Delete avatar route
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// Fetch(read) avatar route
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    // Now first we need to set the header using "req.set()" method
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
