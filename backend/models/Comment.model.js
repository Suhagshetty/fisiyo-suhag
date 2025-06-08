import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    body: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    handle: String,
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for quick lookups
commentSchema.index({ post: 1, createdAt: -1 });

// Use "Comment" (singular) - Mongoose will make it "comments" (plural, lowercase)
const Comment = mongoose.model("Comment", commentSchema);


export default Comment;
