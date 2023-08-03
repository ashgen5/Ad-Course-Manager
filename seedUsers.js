const mongoose = require("mongoose");
const User = require("./models/user");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");
});

const seedUsers = async () => {
  await User.deleteMany({});

  const users = [
    {
      name: "Ashley Scott",
      email: "ashley1@example.com",
      password: "$2b$10$aW.tv5f2MFnGyKr9wgkqse1cRN0g4FNkFZMRexiTX/X9UUTSINJOq",
      enrolledCourses: ["64bebf3b21f0bcb080d314ea"],
      completedCourses: ["64bebf3b21f0bcb080d314ec"],
      profilePicture: "/imgs/Adtelligent Black Logo.png",
    },
    {
      name: "Mark M",
      email: "mark2@example.com",
      password: "$2b$10$wmXJG9uAYiml9bL2wXvEQeIoaqYxaxj0NGehFWFW.JnC/HcWvBVAm",
      enrolledCourses: ["64bebf3b21f0bcb080d314ea"],
      completedCourses: ["64bebf3b21f0bcb080d314ec"],
      profilePicture: "imgs/Adtelligent Black Logo.png",
    },
  ];

  await User.insertMany(users);
  console.log("Users seeded!");
};

seedUsers().then(() => {
  mongoose.connection.close();
});
