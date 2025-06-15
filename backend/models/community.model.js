import mongoose from "mongoose";

const { Schema } = mongoose;

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: String,
    bannerUrl: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    postCount: {
      type: Number,
      default: 0,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    pinnedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    rules: [
      {
        title: String,
        description: String,
      },
    ],
    requirePostApproval: {
      type: Boolean,
      default: false,
    },
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
    colorPrimary: {
      type: String,
      default: "#0079D3",
    },
    colorSecondary: {
      type: String,
      default: "#FFFFFF",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
communitySchema.index({ name: 1 }, { unique: true });
communitySchema.index({ memberCount: -1 });
communitySchema.index({ postCount: -1 });

const Community = mongoose.model("Community", communitySchema);

export default Community;
