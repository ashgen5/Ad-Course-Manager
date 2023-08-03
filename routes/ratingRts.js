const express = require("express");
const router = express.Router();
const Rating = require("../models/rating");
const { authenticateJWT } = require("../authMiddleware");
const { check, validationResult } = require("express-validator");

router.get("/:courseId", async (req, res) => {
  try {
    const ratings = await Rating.find({ course: req.params.courseId });
    res.json(ratings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
