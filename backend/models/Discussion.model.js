import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
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
    communityHandle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    community_dp: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      default: null, // null means it's a top-level comment
    },

    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discussion",
      },
    ],

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

    isEdited: {
      type: Boolean,
      default: false,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
discussionSchema.index({ post: 1, createdAt: -1 });
discussionSchema.index({ parentComment: 1 });
discussionSchema.index({ community: 1, createdAt: -1 });

const Discussion = mongoose.model("Discussion", discussionSchema);
export default Discussion;
