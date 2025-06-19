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
      maxlength: 10000,
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
    imageUrl: [String], // Should be array of strings
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userHandle: { type: String, required: true, trim: true, maxlength: 100 },
    communityHandle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
    community_dp: {
      type: String,
      required: true,
      trim: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    commentsandreplies: [
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
    isApproved: {
      type: Boolean,
      default: false,
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
