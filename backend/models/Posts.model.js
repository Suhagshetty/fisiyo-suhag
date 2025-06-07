import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        match: [
          /^[a-z0-9-]+$/,
          "Tags can only contain letters, numbers and hyphens",
        ],
        maxlength: 30,
      },
    ],
    imageUrl: [
      {
        type: String, // stored as uploaded filename (e.g., "abc123.jpg")
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userHandle: { type: String, required: true, trim: true, maxlength: 100 },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model if you have one
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model if you have one
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Indexes
postSchema.index({ author: 1, community: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
