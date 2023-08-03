const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserCourseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  enrollTimestamp: { type: Date, default: Date.now },
  finishTimestamp: { type: Date },
});

module.exports = mongoose.model("UserCourse", UserCourseSchema);
