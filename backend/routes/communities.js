import express from "express";
import Community from "../models/community.model.js";
const router = express.Router();

// Create a new community
router.post("/", async (req, res) => {
  try {
    const newCommunity = new Community(req.body);
    const savedCommunity = await newCommunity.save();
    res.status(201).json(savedCommunity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Get community by name
router.get("/name/:name", async (req, res) => {
  try {
    const communityName = req.params.name.toLowerCase();
    const community = await Community.findOne({ name: communityName })
      .populate("createdBy", "username profilePicture")
      .populate("moderators", "username")
      .populate("members", "username");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this to your community routes file
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find()
      .select("name description memberCount avatarUrl")
      .sort({ memberCount: -1 })
      .limit(10);
    res.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
