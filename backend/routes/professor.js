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
      phoneNumber: req.body.phoneNumber,
      occupation: req.body.occupation,
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
    res.status(500).json({ error: "Server error", err });
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

router.get("/:id", async (req, res) => {
  try {
    const professorId = req.params.id;
    const professor = await Professor.findOne({ professorid: professorId });

    if (professor) {
      res.status(200).json(professor);
    } else {
      res.status(404).send("Professor not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 

router.get("/handle/:handle", async (req, res) => {
  try {
    const professorHandle = req.params.handle.toLowerCase();
    const professor = await Professor.findOne({
      handle: professorHandle,
    }).lean();

    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }

    res.json(professor);
  } catch (error) {
    console.error("Error fetching professor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get saved posts for professor
router.get('/saved-posts/:professorId', async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.professorId)
      .populate('savedPosts')
      .exec();

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json(professor.savedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save post for professor
router.post('/save-post', async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const professor = await Professor.findById(userId);

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    // Add post if not already saved
    if (!professor.savedPosts.includes(postId)) {
      professor.savedPosts.push(postId);
      await professor.save();
    }

    res.json({ message: 'Post saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unsave post for professor
router.post('/unsave-post', async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const professor = await Professor.findById(userId);

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    // Remove post from saved
    professor.savedPosts = professor.savedPosts.filter(
      id => id.toString() !== postId
    );

    await professor.save();
    res.json({ message: 'Post unsaved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 


export default router;
