const express = require("express");
const router = express.Router();
const Department = require("../models/department");

// Get all departments

router.get("/all-departments", async (req, res) => {
  const departments = await Department.find();
  res.json(departments);
});

// Create a new department

router.post("/add-department", async (req, res) => {
  const { name, description } = req.body;
  const newDepartment = new Department({ name, description });
  await newDepartment.save();
  res.json(newDepartment);
});
module.exports = router;
