const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const { authenticateJWT } = require("../authMiddleware.js");
const Course = require("../models/course");

// // Post a new comment
// router.post("/", authenticateJWT, async (req, res) => {
//   try {
//     const { courseId, text } = req.body;
//     const comment = new Comment({ text, course: courseId, user: req.user.id });
//     await comment.save();
//     res.status(201).json(comment);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to post comment" });
//   }
// });

// Create a new comment
router.post("/comments", async (req, res) => {
  const { userId, courseId, content } = req.body;

  try {
    const comment = new Comment({ userId, courseId, content });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for a course
router.get("/courses/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ courseId: req.params.id }).populate(
      "userId",
      "username"
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
