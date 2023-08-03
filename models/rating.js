const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatingSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rating", RatingSchema);
