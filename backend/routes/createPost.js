import express from "express";
import Post from "../models/Posts.model.js";
import Comment from "../models/Comment.model.js";

const router = express.Router();

router.post("/create-post", async (req, res) => {
  try {
    const { title, description, tags, imageUrl, author, userHandle } = req.body;

    const newPost = new Post({
      title,
      description,
      tags,
      imageUrl: imageUrl ? [imageUrl] : [], // Convert to array
      author,
      userHandle,
    });

    const savedPost = await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully", post: savedPost });
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
    const { body, author, handle } = req.body;

    // Create new comment
    const newComment = new Comment({
      body,
      author,
      handle,
      post: postId
    });

    const savedComment = await newComment.save();
    
    // Push comment ID to the post's comments array
    await Post.findByIdAndUpdate(
      postId, 
      { $push: { comments: savedComment._id } },
      { new: true }
    );
    
    res.status(201).json(savedComment);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: err.message || "Comment creation failed" });
  }
});

// Update GET comments route to populate author info
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username handle') // Add this line
      .sort({ createdAt: -1 })
      .lean();

    // Map to desired structure
    const formattedComments = comments.map(comment => ({
      ...comment,
      handle: comment.author?.handle || comment.handle,
      author: comment.author?._id
    }));

    res.status(200).json(formattedComments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

export default router;
