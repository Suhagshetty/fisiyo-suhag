import express from "express";
import Post from "../models/Posts.model.js";
import Comment from "../models/Comment.model.js"; // make sure the Comment model is defined as discussed

const router = express.Router();

/**
 * POST /create-comment
 * Expects in req.body:
 *   - postId       : ObjectId of the Post being commented on
 *   - communityId  : ObjectId of the Community (optional if you derive from post)
 *   - author       : ObjectId of the User making the comment
 *   - userHandle   : String handle of the commenting user
 *   - body         : String content of the comment
 */
router.post("/create-comment", async (req, res) => {
  try {
    const { postId, communityId, author, userHandle, body } = req.body;

    // Validate required fields
    if (!postId || !author || !userHandle || !body) {
      return res
        .status(400)
        .json({ error: "postId, author, userHandle, and body are required." });
    }

    // Create new Comment document
    const newComment = new Comment({
      body,
      author,
      userHandle,
      post: postId,
      community: communityId || null,
    });
    const savedComment = await newComment.save();

    // Push the comment _id into the Post.comments array
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: savedComment._id } },
      { new: true }
    );

    return res
      .status(201)
      .json({ message: "Comment created successfully", comment: savedComment });
  } catch (err) {
    console.error("Create comment error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Comment creation failed" });
  }
});

export default router;
