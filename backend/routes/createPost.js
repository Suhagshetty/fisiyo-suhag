import express from "express";
import Post from "../models/Posts.model.js";

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

export default router;
