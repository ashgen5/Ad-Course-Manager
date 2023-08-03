const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const dotenv = require("dotenv");
const { authenticateJWT, isAdmin } = require("../authMiddleware.js");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const user = require("../models/user");

dotenv.config();

// // Login

router.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Something went wrong",
        user: user,
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET_KEY);
      return res.json({ message: "Login successful", user, token });
    });
  })(req, res);
});

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),

    check("email", "Please include a valid email").isEmail(),

    check("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const user = new User({ name, email, password });
    await user.save();
    req.login(user, (err) => {
      if (err) console.log(err);
      res.json({ message: "Registration successful" });
    });
  }
);

router.put(
  "/updateProfilePicture",
  authenticateJWT,
  upload.single("picture"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      user.profilePicture = req.file.path;
      await user.save();
      res.json({ message: "Profile picture updated", user });
    } catch (error) {
      next(error);
    }
  }
);

// Existing code...

// Get profile of the current user
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses")
      .populate("completedCourses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile of the current user
router.get("/getUser", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/user/account", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name profilePicture department"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Logout
router.post("/logout", authenticateJWT, (req, res) => {
  res.json({ message: "Logout successful" });
});

router.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const userData = { ...user };
    delete userData.password;
    return res.json({ user: userData });
  });
});

// Route to add a course
router.post("/admin/add-course", authenticateJWT, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Logic to add course to the database
  const course = new Course(req.body);
  await course.save();

  res.send(course);
});

// Route to add a department
router.post("/admin/add-department", authenticateJWT, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const department = new Department(req.body);
  await department.save();

  res.send(department);
});

module.exports = router;
