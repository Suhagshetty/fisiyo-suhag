const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Main Schema: Community
 */
const communitySchema = new Schema(
  {
    // Unique lowercase identifier (e.g., "javascript", "reactjs")
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Display title (e.g., "Learn JavaScript")
    title: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },

    // Short description of the community
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Avatar and banner images (URLs or file references)
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    bannerUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Who created the community
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // List of moderators
    moderators: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // List of members
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // Whether the community is private (invite-only)
    isPrivate: {
      type: Boolean,
      default: false,
    },

    // All posts in this community
    posts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: [],
    },
    // Pinned/sticky posts (subset of posts)
    pinnedPosts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: [],
    },

    // Community rules/guidelines
    rules: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
            default: "",
          },
          description: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
      default: [],
    },

    // Automoderator configuration (JSON blob)
    automodConfig: {
      type: Schema.Types.Mixed,
      default: {}, // e.g. { bannedWords: [...], maxSpamThreshold: 5 }
    },
    // If true, all new posts must be approved by a moderator
    requirePostApproval: {
      type: Boolean,
      default: false,
    },

    // Denormalized counts (updated in application logic)
    memberCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    // Default sorting when users view the community
    defaultSort: {
      type: String,
      enum: ["hot", "new", "top"],
      default: "hot",
    },

    // Theme / color settings (hex codes)
    colorPrimary: {
      type: String,
      trim: true,
      default: "#0079D3",
    },
    colorSecondary: {
      type: String,
      trim: true,
      default: "#FFFFFF",
    },

    // If archived, no new posts or membership changes are allowed
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for faster lookups / sorting
communitySchema.index({ name: 1 }, { unique: true });
communitySchema.index({ memberCount: -1 });
communitySchema.index({ postCount: -1 });

module.exports = mongoose.model("Community", communitySchema);
