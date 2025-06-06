import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500, // or whatever limit you prefer
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userHandle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    // You can add nested replies here if desired,
    // but you’d typically store replies as separate documents too.
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Index so you can quickly find all comments for a given post (sorted by time):
commentSchema.index({ post: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
