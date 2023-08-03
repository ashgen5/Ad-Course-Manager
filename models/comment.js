const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSc = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSc);
