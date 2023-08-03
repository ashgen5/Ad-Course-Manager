const express = require("express");
const Course = require("../models/course");
const router = express.Router();

router.get("/search", async (req, res) => {
  const q = req.query.q;

  const query = {
    $or: [
      { name: { $regex: new RegExp(q), $options: "i" } },
      { keySkills: { $regex: new RegExp(q), $options: "i" } },
    ],
  };
  try {
    const courses = await Course.find(query).exec();
    res.json(courses);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
