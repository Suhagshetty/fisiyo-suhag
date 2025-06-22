import express from "express";
import mongoose from "mongoose";
import Student from "../models/student.model.js";

const router = express.Router();

// Create new student
router.post("/", async (req, res) => {
  try {
    const studentData = {
      userid: req.body.userid,
      name: req.body.name,
      email: req.body.email,
      handle: req.body.handle,
      gender: req.body.gender,
      occupation: req.body.occupation,
      phoneNumber: req.body.phoneNumber,
      age: req.body.age,
      role: "student",
      interests: req.body.interests,
      profilePicture: req.body.profilePicture || null,
      educationLevel: req.body.educationLevel,
      institutionName: req.body.institutionName,
      institutionRegNumber: req.body.institutionRegNumber,
      currentGradeYear: req.body.currentGradeYear,
    };

    // Validate required fields
    const requiredFields = [
      "userid",
      "name",
      "email",
      "handle",
      "gender",
      "age",
      "educationLevel",
      "institutionName",
      "institutionRegNumber",
      "currentGradeYear",
      "occupation",
    ];

    const missingFields = requiredFields.filter((field) => !studentData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missing: missingFields,
      });
    }

    // Validate enum values
    const validEducationLevels = ["School", "College"];
    if (!validEducationLevels.includes(studentData.educationLevel)) {
      return res.status(400).json({ error: "Invalid education level" });
    }

    const validSchoolGrades = ["8th", "9th", "10th", "11th", "12th"];
    const validCollegeYears = [
      "1st year",
      "2nd year",
      "3rd year",
      "4th year",
      "5th year",
    ];

    const validGrades = [...validSchoolGrades, ...validCollegeYears];
    if (!validGrades.includes(studentData.currentGradeYear)) {
      return res.status(400).json({ error: "Invalid grade/year selection" });
    }

    const newStudent = new Student(studentData);
    await newStudent.save();

    res.status(201).json(newStudent);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        error: `${field} already exists`,
        field,
      });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Get student by user ID
router.get("/:userId", async (req, res) => {
  try {
    const student = await Student.findOne({ userid: req.params.userId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update student profile
router.patch("/:userId", async (req, res) => {
  try {
    const updates = {
      ...req.body,
      // Prevent updating protected fields
      userid: undefined,
      email: undefined,
      role: undefined,
      institutionRegNumber: undefined,
    };

    // Validate education level if being updated
    if (updates.educationLevel) {
      const validEducationLevels = ["School", "College"];
      if (!validEducationLevels.includes(updates.educationLevel)) {
        return res.status(400).json({ error: "Invalid education level" });
      }
    }

    // Validate grade/year if being updated
    if (updates.currentGradeYear) {
      const validSchoolGrades = ["8th", "9th", "10th", "11th", "12th"];
      const validCollegeYears = [
        "1st year",
        "2nd year",
        "3rd year",
        "4th year",
        "5th year",
      ];
      const validGrades = [...validSchoolGrades, ...validCollegeYears];

      if (!validGrades.includes(updates.currentGradeYear)) {
        return res.status(400).json({ error: "Invalid grade/year selection" });
      }
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { userid: req.params.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        error: `${field} already exists`,
        field,
      });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Check handle availability
router.get("/check-handle", async (req, res) => {
  try {
    const { handle } = req.query;

    if (!handle || handle.length < 3) {
      return res
        .status(400)
        .json({ error: "Handle must be at least 3 characters" });
    }

    const existingUser = await Student.findOne({ handle }).collation({
      locale: "en",
      strength: 2,
    });

    res.json({ exists: !!existingUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
