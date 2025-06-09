import express from "express";
import Post from "../models/Posts.model.js";
import Comment from "../models/Comment.model.js";
import mongoose from "mongoose";
import Community from "../models/community.model.js";
import User from "../models/Users.model.js"

const router = express.Router();

router.post("/create-post", async (req, res) => {
  try {
    const {
      title,
      description,
      tags,
      imageUrl,
      author,
      userHandle,
      community,
      communityHandle,
      community_dp,
    } = req.body;

    const newPost = new Post({
      title,
      description,
      tags,
      imageUrl: imageUrl ? [imageUrl] : [],
      author,
      userHandle,
      community,
      communityHandle,
      community_dp,
    });

    const savedPost = await newPost.save();

    // Update Community
    await Community.findByIdAndUpdate(
      community,
      {
        $push: { posts: savedPost._id },
        $inc: { postCount: 1 },
      },
      { new: true }
    );

    // Update User
    await User.findByIdAndUpdate(
      author,
      {
        $push: { posts: savedPost._id },
      },
      { new: true }
    );

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: err.message || "Post creation failed" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Add this new route to your router
router.get("/posts/by-communities", async (req, res) => {
  try {
    // Get community IDs from query parameters
    const communityIds = req.query.ids;
    
    if (!communityIds) {
      return res.status(400).json({ error: "Missing community IDs" });
    }

    // Convert comma-separated string to array of ObjectIds
    const communityIdArray = communityIds.split(',').map(id => 
      mongoose.Types.ObjectId.createFromHexString(id)
    );

    // Fetch posts from the specified communities
    const posts = await Post.find({
      community: { $in: communityIdArray }
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Fetch posts by communities error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


// Add these routes to your existing router file

// POST route for voting on posts
router.post("/posts/:postId/vote", async (req, res) => {
  try {
    const { postId } = req.params;
    const { voteType, userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (voteType && !['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Initialize vote arrays if they don't exist
    if (!post.upvotes) post.upvotes = [];
    if (!post.downvotes) post.downvotes = [];

    // Remove user from both arrays first
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());

    // Add user to appropriate array if voteType is provided
    if (voteType === 'up') {
      post.upvotes.push(userId);
    } else if (voteType === 'down') {
      post.downvotes.push(userId);
    }

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json({
      message: "Vote updated successfully",
      postId: updatedPost._id,
      upvotes: updatedPost.upvotes.length,
      downvotes: updatedPost.downvotes.length,
      userVote: voteType
    });

  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ error: err.message || "Failed to update vote" });
  }
});

// GET route to fetch user's votes for all posts (optional - for initialization)
router.get("/posts/votes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      $or: [
        { upvotes: userId },
        { downvotes: userId }
      ]
    }).select('_id upvotes downvotes');

    const userVotes = {};
    posts.forEach(post => {
      if (post.upvotes.includes(userId)) {
        userVotes[post._id] = 'up';
      } else if (post.downvotes.includes(userId)) {
        userVotes[post._id] = 'down';
      }
    });

    res.status(200).json(userVotes);

  } catch (err) {
    console.error("Fetch votes error:", err);
    res.status(500).json({ error: "Failed to fetch user votes" });
  }
});


// Add this to the POST comment route after saving the comment
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { body, author, handle, userDp } = req.body;

    // Create new comment
    const newComment = new Comment({
      body,
      author,
      handle,
      post: postId,
      userDp,
    });

    const savedComment = await newComment.save();
    
    // Push comment ID to the post's comments array
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: savedComment._id } },
      { $push: { commentsandreplies: savedComment._id } },
      { new: true }
    );
    
    res.status(201).json(savedComment);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: err.message || "Comment creation failed" });
  }
});

router.post("/comments/:commentId/vote", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType, userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Remove existing votes
    comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId);
    comment.downvotes = comment.downvotes.filter(
      (id) => id.toString() !== userId
    );

    // Add new vote
    if (voteType === "up") {
      comment.upvotes.push(userId);
    } else if (voteType === "down") {
      comment.downvotes.push(userId);
    }

    // Calculate new vote count
    comment.voteCount = comment.upvotes.length - comment.downvotes.length;
    await comment.save();

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add this route to handle nested replies
router.post('/comments/:commentId/reply', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { body, author, handle, userDp } = req.body;

    // Find the parent comment
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found" });
    }

    // Create new reply with parent reference
    const newReply = new Comment({
      body,
      author,
      handle,
      userDp,
      post: parentComment.post, // Same post as parent
      parentComment: commentId, // Set parent comment reference
    });

    const savedReply = await newReply.save();

    // Add reply ID to parent comment's replies array
    await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: savedReply._id } },
      { new: true }
    );

    // Also update the post's comment count
    await Post.findByIdAndUpdate(
      parentComment.post,
      { $inc: { commentCount: 1 } },
      { new: true }
    );

    res.status(201).json(savedReply);
  } catch (err) {
    console.error("Create reply error:", err);
    res.status(500).json({ error: err.message || "Reply creation failed" });
  }
});

// Update the GET comments route to populate replies

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch all comments for the post
    const allComments = await Comment.find({ post: postId }).lean();

    // Build a map of commentId -> comment
    const commentMap = {};
    allComments.forEach((comment) => {
      comment.replies = []; // init empty replies
      commentMap[comment._id.toString()] = comment;
    });

    // Construct tree
    const topLevelComments = [];
    allComments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment.toString()];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    res.status(200).json(topLevelComments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

export default router;
