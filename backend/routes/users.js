import express from "express";
import User from "../models/Users.model.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userData = {
      userid: req.body.userid,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      interests: req.body.interests,
      handle: req.body.handle,
      gender: req.body.gender,
      age: req.body.age,
      profilePicture: req.body.profilePicture || null, // Add profile picture field
    };

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/check-handle", async (req, res) => {
  try {
    const handle = req.query.handle?.toLowerCase();
    if (!handle) {
      return res.status(400).json({ message: "Handle is required" });
    }

    const user = await User.findOne({ handle });
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error("Error checking handle:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ userid: userId });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/handle/:handle", async (req, res) => {
  try {
    const userHandle = req.params.handle.toLowerCase();
    const user = await User.findOne({ handle: userHandle })
      .populate("followers", "name handle profilePicture")
      .populate("followingUsers", "name handle profilePicture")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add followersCount for easier access
    user.followersCount = user.followers?.length || 0;

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add to users.route.js

// Get user suggestions
router.post("/suggestions", async (req, res) => {
  try {
    const { excludeId, limit = 10 } = req.body;

    // Validate ObjectId
    if (!excludeId || !mongoose.Types.ObjectId.isValid(excludeId)) {
      return res.status(400).json({ message: "Invalid excludeId" });
    }

    const pipeline = [
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } },
      { $sample: { size: parseInt(limit) || 10 } },
      { $project: { _id: 1, name: 1, handle: 1, profilePicture: 1 } },
    ];

    const suggestions = await User.aggregate(pipeline);
    res.json(suggestions);
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change from path parameter to query parameter

// Follow a user
router.post("/follow", async (req, res) => {
  try {
    const { followerId, followeeId } = req.body;

    await User.findByIdAndUpdate(followerId, {
      $addToSet: { followingUsers: followeeId },
    });

    await User.findByIdAndUpdate(followeeId, {
      $addToSet: { followers: followerId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save a post
router.post("/save-post", async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if post is already saved
    if (user.savedPosts.includes(postId)) {
      return res.status(200).json({ message: "Post already saved" });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.status(200).json({ message: "Post saved successfully" });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unsave a post
router.post("/unsave-post", async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    await user.save();

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get saved posts
router.get("/saved-posts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("savedPosts");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.savedPosts);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
