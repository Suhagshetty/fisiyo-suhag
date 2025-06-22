// routes/guest.js

import express from "express";
import mongoose from "mongoose";
import Guest from "../models/guest.model.js";

const router = express.Router();

// POST route to create a new guest
router.post("/", async (req, res) => {
  console.log("Guest POST route hit");
  console.log("Request body:", req.body);

  try {
    // Generate unique ID for guest
    const guestId = new mongoose.Types.ObjectId().toString();

    // Validate required fields
    const {
      name,
      email,
      age,
      gender,
      occupation,
      interests,
      profilePicture,
      phoneNumber,
    } = req.body;

    // Basic validations (you can add more detailed ones if needed)
    if (!name || !email || !age || !gender || !occupation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate gender
    const validGenders = ["male", "female", "other", "prefer not to say"];
    if (!validGenders.includes(gender)) {
      return res
        .status(400)
        .json({
          error: `Invalid gender. Must be one of: ${validGenders.join(", ")}`,
        });
    }

    // Validate occupation
    const validOccupations = ["Student", "Working", "Prefer not to say"];
    if (!validOccupations.includes(occupation)) {
      return res
        .status(400)
        .json({
          error: `Invalid occupation. Must be one of: ${validOccupations.join(
            ", "
          )}`,
        });
    }

    // Prepare guest data
    const guestData = {
      userid: guestId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      profilePicture: profilePicture || null,
      age: parseInt(age),
      phoneNumber: phoneNumber,
      gender,
      occupation,
      interests: Array.isArray(interests) ? interests : [],
    };

    console.log("Creating guest with data:", guestData);

    // Save guest
    const newGuest = new Guest(guestData);
    await newGuest.save();

    // Optional token logic
    const token = generateGuestToken(guestId);

    // Respond with guest data
    res.status(201).json({
      ...newGuest.toObject(),
      token,
    });
  } catch (err) {
    console.error("Error creating guest:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: err.message });
    }

    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate userid or email" });
    }

    res.status(500).json({ error: "Server error", err });
  }
});

// Simple token generator (optional)
function generateGuestToken(guestId) {
  return Buffer.from(`${guestId}:${Date.now()}`).toString("base64");
}

export default router;
