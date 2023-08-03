const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { authenticateJWT, isAdmin } = require("../authMiddleware.js");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config();

router.get("/", authenticateJWT, async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

router.post("/add", async (req, res, next) => {
  try {
    const { name, description, keySkills, link, duration, department } =
      req.body;

    // Construct a new course using the Course model
    const course = new Course({
      name,
      description,
      keySkills,
      link,
      duration,
      department,
    });

    // Save the course to the database
    await course.save();

    // Return the course to the client
    res.json(course);
  } catch (error) {
    next(error); // Pass the error to your error handling middleware
  }
});

router.get("/courses", authenticateJWT, async (req, res) => {
  try {
    const courses = await Course.find({}).populate("department");

    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/user-courses", authenticateJWT, async (req, res) => {
  console.log("Reached /user-courses");
  console.log("User ID", req.user._id);
  try {
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses")
      .populate("enrolledCourses.comments.user")
      .populate("completedCourses")
      .populate("completedCourses.comments.user");
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    res.json({
      enrolledCourses: user.enrolledCourses,
      completedCourses: user.completedCourses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/enroll", authenticateJWT, async (req, res) => {
  console.log(req.body);
  const courseId = req.body.courseId;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (user.completedCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "You have already completed this course" });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    user.enrolledCourses.push(courseId);
    await user.save();

    res.json({ message: "Successfully enrolled in course" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID
router.get("/:id", authenticateJWT, isAdmin, async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json(course);
});

// Mark a course as finished
router.put("/:id/finish", authenticateJWT, async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.finished = true;
  await course.save();

  const user = await User.findOne({ enrolledCourses: course._id });
  if (user) {
    user.enrolledCourses.pull(course._id);
    user.completedCourses.push(course._id);
    await user.save();
  }
  res.json(course);
});

// Leave a comment on a course
router.post("/:id/comments", authenticateJWT, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(400).json({ messages: "Invalid Course ID" });
    }
    course.comments.push({
      user: req.user._id,
      comment: comment,
    });
    await course.save();
    res.json(course);
  } catch (error) {
    next(error);
  }
});

// Leave a rating on a course
router.post("/:courseId/rate", authenticateJWT, async (req, res) => {
  const { rating } = req.body;
  const userId = req.user._id;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    course.ratings.push({
      user: userId,
      rating: rating,
    });

    const updatedCourse = await course.save();

    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/:courseId/user/:userId/rating",
  authenticateJWT,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const userRating = course.ratings.find(
        (rating) => rating.user.toString() === req.params.userId
      );

      if (!userRating) {
        return res.status(204).end();
      }

      return res.json(userRating);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
