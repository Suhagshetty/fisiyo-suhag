import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userid: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email"],
  },
 
  interests: { type: [String], default: [] },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer not to say"],
    default: "prefer not to say",
  },
  role: {
    type: String,
    enum: ["user", "professor", "moderator"],
    default: "user",
    required: true,
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] },
  ],
  savedPosts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] },
  ],
  likedPosts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] },
  ],
  dislikedPosts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] },
  ],
  upvotedComments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] },
  ],
  downvotedComments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] },
  ],
  followingCommunities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: [] },
  ],
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  followingUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
 
  reputation: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 }, 
  loginStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  dailyActivity: {
    type: Map,
    of: Number,
    default: {},
  },
  isTopUser: { type: Boolean, default: false },
  impactScore: { type: Number, default: 0 },
  challengesCompleted: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
