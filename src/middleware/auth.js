const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", ""); // We get "token" from the header send by the user
    const decode = jwt.verify(token, "thisissecretkey"); // This will return obj of id, if not found then catch() will get execute
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });

    if (!user) {
      throw new Error();
    }

    req.user = user; // Here we are storing the auth user, so we can use it in router file.
    req.token = token; // we store token also, bcuz we want to target from which the user going to logout, i.e. mobile,laptop or anywhere
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate..." });
  }
};

module.exports = auth;
