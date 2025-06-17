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


// Vote on a poll
router.post("/:pollId/vote", async (req, res) => {
  try {
    const { pollId } = req.params;
    const { userId, selectedOption } = req.body;

    // Validate input
    if (!userId || selectedOption === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({ error: "Poll has ended" });
    }

    // Check if user has already voted
    if (poll.votedUsers.includes(userId) && !poll.allowMultipleVotes) {
      return res.status(400).json({ error: "User has already voted" });
    }

    // Update the poll
    const updatedPoll = await Poll.findByIdAndUpdate(
      pollId,
      {
        $addToSet: { votedUsers: userId },
        $push: { 
          "votes": { 
            userId, 
            selectedOptions: [selectedOption] 
          } 
        },
        $inc: { totalVotes: 1 },
        $inc: { [`options.${selectedOption}.votes`]: 1 }
      },
      { new: true }
    );

    res.json(updatedPoll);
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Internal server error" });
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

// router.get("/", async (req, res) => {
//   try {
//     const polls = await Poll.find().sort({ createdAt: -1 });
//     res.status(200).json(polls);
//   } catch (err) {
//     console.error("Fetch posts error:", err);
//     res.status(500).json({ error: "Failed to fetch posts" });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.status(200).json(polls);
  } catch (err) {
    console.error("Fetch polls error:", err);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});



export default router;
