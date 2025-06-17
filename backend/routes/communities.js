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
      .populate("members", "username")
      // .populate("posts")

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
 
// Join community route
router.post('/:id/join', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const userId = req.user._id;
    
    // Check if user is already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({ error: 'User already a member' });
    }

    // Add user to members
    community.members.push(userId);
    community.memberCount += 1;
    
    const updatedCommunity = await community.save();
    res.json(updatedCommunity);
  } catch (err) {
    
    console.error("Join error:", err); // Log detailed error
    res.status(500).json({ error: "Server error" });
  }
});

// Leave community route
router.post('/:id/leave', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const userId = req.user._id;
    const index = community.members.indexOf(userId);
    
    if (index === -1) {
      return res.status(400).json({ error: 'User not a member' });
    }

    // Remove user from members
    community.members.splice(index, 1);
    community.memberCount -= 1;
    
    const updatedCommunity = await community.save();
    res.json(updatedCommunity);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
 
export default router;
