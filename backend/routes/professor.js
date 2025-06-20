import express from "express";
import mongoose from "mongoose";
import Professor from "../models/professor.model.js";

const router = express.Router();

// Create new professor
router.post("/", async (req, res) => {
  try {
    const professorData = {
      userid: req.body.userid,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      interests: req.body.interests,
      handle: req.body.handle,
      gender: req.body.gender,
      age: req.body.age,
      profilePicture: req.body.profilePicture || null,
      institution: req.body.institution,
    };

    // Validate required fields
    if (!professorData.userid || !professorData.email || !professorData.name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProfessor = new Professor(professorData);
    await newProfessor.save();

    res.status(201).json(newProfessor);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Get professor by user ID
router.get("/:userId", async (req, res) => {
  try {
    const professor = await Professor.findOne({ userid: req.params.userId });

    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    res.json(professor);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update professor profile
router.patch("/:userId", async (req, res) => {
  try {
    const updates = {
      ...req.body,
      // Prevent updating protected fields
      userid: undefined,
      email: undefined,
    };

    const updatedProfessor = await Professor.findOneAndUpdate(
      { userid: req.params.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProfessor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    res.json(updatedProfessor);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
