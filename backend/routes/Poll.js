import express from "express";
import Poll from "../models/Poll.model.js";
import Community from "../models/community.model.js";
import mongoose from "mongoose";

const router = express.Router();

// Create poll endpoint
router.post("/create-poll", async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "question",
      "options",
      "author",
      "userHandle",
      "community",
      "communityHandle",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Validate community exists
    const communityExists = await Community.exists({
      _id: req.body.community,
      name: req.body.communityHandle,
    });

    if (!communityExists) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Create new poll
    const newPoll = new Poll({
      ...req.body,
      expiresAt:
        req.body.expiresAt || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    // Save to database
    const savedPoll = await newPoll.save();

    // Populate author information
    await savedPoll.populate("author", "username profilePicture");
    await savedPoll.populate("community", "name url");

    res.status(201).json(savedPoll);
  } catch (error) {
    console.error("Poll creation error:", error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ errors: messages });
    }

    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:pollId/vote", async (req, res) => {
  try {
    const { selectedOptions, userId } = req.body;
    const pollId = req.params.pollId;

    // Validate inputs
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
      return res.status(400).json({ message: "Invalid selectedOptions" });
    }

    if (!pollId || !mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid poll ID" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Convert userId to string for comparison
    const userIdStr = userId.toString();

    // Check if user already voted (handles both ObjectId and string)
    const alreadyVoted = poll.votedUsers.some(
      (id) => id.toString() === userIdStr
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: "Already voted" });
    }

    // Check expiration
    if (new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({ message: "Poll expired" });
    }
    // Inside vote endpoint
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        message: "Valid user ID is required",
        received: userId,
      });
    }

    // Update vote counts
    selectedOptions.forEach((optionIndex) => {
      if (optionIndex < poll.options.length) {
        poll.options[optionIndex].voteCount += 1;
      }
    });

    // Add user to voted list (store as ObjectId if possible)
    let userIdToStore = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userIdToStore = new mongoose.Types.ObjectId(userId);
    }

    poll.votedUsers.push(userIdToStore);
    poll.totalVotes += 1;

    await poll.save();
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/votes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find all polls where the user has voted
    const votedPolls = await Poll.find({
      "votes.userId": userId,
    });

    // Create a map of pollId -> selected options
    const userVotes = {};
    votedPolls.forEach((poll) => {
      const userVote = poll.votes.find(
        (vote) => vote.userId.toString() === userId
      );
      if (userVote) {
        userVotes[poll._id] = userVote.selectedOptions;
      }
    });

    res.status(200).json(userVotes);
  } catch (error) {
    console.error("Error fetching user votes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.status(200).json(polls);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
export default router;
