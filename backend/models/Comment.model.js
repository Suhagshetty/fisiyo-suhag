  import mongoose from "mongoose";

  const commentSchema = new mongoose.Schema(
    {
      body: String,

      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      userDp: {
        type: String, // Typically a URL to the user's profile picture
        required: true,
      },

      handle: {
        type: String,
        required: true,
      },

      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
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
      imageUrl: [
        {
          type: String,
          required: true
        },
      ],
      replies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment", // Self-reference for nested replies
        },
      ],

      parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
      },
    },
    { timestamps: true }
  );

  // Index for performance: fetch comments of a post, ordered by creation time
  commentSchema.index({ post: 1, createdAt: -1 });

  const Comment = mongoose.model("Comment", commentSchema);

  export default Comment;
