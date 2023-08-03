// hashPassword.js

const bcrypt = require("bcryptjs");

const saltRounds = 10;
const myPlaintextPassword = "userpw";

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    console.log(hash);
  } catch (err) {
    console.error(err);
  }
};

hashPassword(myPlaintextPassword);
