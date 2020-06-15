const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Task = require("./task");

// Create schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // This will remove space from the name
    },
    age: {
      type: Number,
      default: 0, // if there is no value provided then age will be 0
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive number!");
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true, // This will transfer email into lowercase
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain 'password'");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// Check credentials on user(Model's UDF function)
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Unable to login...You need to singup first!");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password is wrong...!");
  }
  return user;
};

// Generate token(Model instance's UDF function)
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "thisissecretkey");

  // Assign token to the "tokens" field of the userSchema
  user.tokens = user.tokens.concat({ token });
  await user.save(); //store into db

  return token;
};

// Hide data from user, such as password, tokens etc...(WITH 2nd METHOD, EASY & SIMPLE)
//[NOTE: .toJSON will called automatically when the object got stringify by mongoose behind the scene, for more see the notes]
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // "delete" is a keyword used to hide data, which we are sending back to the user
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Create virtual field for relationship between user and task that created by user, this field will not store in database anywhere
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// To use middleware we have two methods of Schema, that is "pre" & "post", pre=run func before save to the db while post=run func after save data to db
userSchema.pre("save", async function (next) {
  const user = this; //bcuz we dont want to refer "this" again n again

  // Run this if the password field changed, otherwise not
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8); //here 8 is parameter of hash algo, so write it as compulsory
  }
  next();
});

// Middleware to delete all tasks when user removed
//[NOTE: In middleware we use second parameter as STANDARD FUNCTION instead of Arrow Funcion bcuz we need to use "this" inside the function and Arrow Function do not support it]
userSchema.pre("remove", async function () {
  const user = this;

  await Task.deleteMany({ owner: user._id });
  next();
});

// Create model
const User = mongoose.model("User", userSchema);

module.exports = User;

// ---------------FOR ONLY UNDERSTANDING-----------------
//Create instance of the model
/*const me = new User({
  name: "   safin      ",
  email: "SAFIN@GMAIL.COM",
});*/

// Save document to the database
/*me.save()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });*/
