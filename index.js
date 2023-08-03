const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const multer = require("multer");
const cookieParser = require("cookie-parser");

const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const port = process.env.PORT || 3000;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const { authenticateJWT } = require("./authMiddleware");
const User = require("./models/user");

const userRoutes = require("./routes/userRts");
const courseRoutes = require("./routes/courseRts");
const commentRoutes = require("./routes/commentsRts");
const departmentRoutes = require("./routes/departmentRts");
const searchRoutes = require("./routes/searchRoute");
const ratingRoutes = require("./routes/ratingRts");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(cors({ credentials: true }));

// app.use(
//   cors({
//     origin: "http://127.0.0.1:8080", // allow to server to accept request from different origin
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true, // allow session cookie from browser to pass through
//   })
// );

app.use(
  cors({
    origin: function (origin, callback) {
      if (origin && origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      } else {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  })
);

app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static("uploads"));

app.use("/user", userRoutes);
app.use("/course", courseRoutes);
app.use("/", commentRoutes);
app.use("/department", departmentRoutes);
app.use("/", searchRoutes);
// app.use("/course", ratingRoutes);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// POST route to handle file uploads
app.post(
  "/upload",
  authenticateJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(400).send({ message: "User not found" });
        return;
      }

      user.profilePicture = "/public/" + req.file.path;
      await user.save();

      res.status(200).send({ message: "Image uploaded successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Image upload failed" });
    }
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      // Match email's user
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "Not User found." });

      // Match Password's User
      const match = await user.checkPassword(password);
      if (match) return done(null, user);
      else return done(null, false, { message: "Incorrect Password." });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.use(function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Send an error response
  res.status(500).send({ message: "An unexpected error occurred" });
});
console.log(__dirname);

app.listen(port, () => console.log(`Listening on port ${port}...`));
