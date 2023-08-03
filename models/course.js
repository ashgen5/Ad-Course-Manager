const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSc = new Schema({
  name: String,
  keySkills: [String],
  description: String,
  link: String,
  finished: { type: Boolean, default: false },
  duration: Number,
  department: { type: Schema.Types.ObjectId, ref: "Department" },
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      comment: String,
      date: { type: Date, default: Date.now },
    },
  ],
  ratings: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      rating: Number,
    },
  ],
});

module.exports = mongoose.model("Course", CourseSc);
