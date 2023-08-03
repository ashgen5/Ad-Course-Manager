const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticateJWT = (req, res, next) => {
  console.log("In authenticateJWT");
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Authorization: 'Bearer Token'

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        console.log("Error during token verification", err);
        return res.sendStatus(403);
      }
      console.log("User verified", user);
      req.user = user;
      next();
    });
  } else {
    console.log("No authorization header present");
    res.sendStatus(401);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ message: "Access denied. Not an admin." });
  }
  next();
};

module.exports = { authenticateJWT, isAdmin };
