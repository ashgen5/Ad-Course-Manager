const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// const UserCourseSchema = new mongoose.Schema({
//   courseId: { type: Schema.Types.ObjectId, ref: "Course" },
//   startDate: { type: Date, default: Date.now },
//   endDate: { type: Date },
// });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: false },
  role: { type: String, default: "user" },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Currently enrolled courses
  completedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Completed courses
  profilePicture: { type: String, default: "../imgs/default photo.jpg" }, // add this line
});

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

UserSchema.methods.checkPassword = function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

UserSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
