const mongoose = require("mongoose");
const Course = require("./models/course");
const dotenv = require("dotenv");
dotenv.config();

const courses = [
  {
    name: "Web Development",
    keySkills: ["HTML", "CSS", "JavaScript"],
    description: "Learn web development from scratch",
    link: "https://example.com/course/web-development",
    duration: 30,
    comments: [],
    ratings: [],
  },
  {
    name: "Data Science",
    keySkills: ["Python", "R", "Statistics"],
    description: "Become a data scientist",
    link: "https://example.com/course/data-science",
    duration: 40,
    comments: [],
    ratings: [],
  },
  // Add more courses if needed

  {
    name: "Machine Learning",
    keySkills: ["Python", "TensorFlow", "Keras"],
    description: "Dive into the world of AI and machine learning",
    link: "https://example.com/course/machine-learning",
    duration: 45,
    comments: [],
    ratings: [],
  },

  {
    name: "Mobile App Development",
    keySkills: ["Swift", "Kotlin", "React Native"],
    description: "Develop your first mobile application",
    link: "https://example.com/course/mobile-app-development",
    duration: 35,
    comments: [],
    ratings: [],
  },
];

async function seedCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Course.deleteMany({});

    for (const courseData of courses) {
      await Course.create(courseData);
    }

    console.log("Courses seeded successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding courses:", error);
  }
}

seedCourses();
