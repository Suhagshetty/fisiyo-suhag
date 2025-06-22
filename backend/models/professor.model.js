import mongoose from "mongoose";

const professorSchema = new mongoose.Schema(
  {
    // Base user fields (unchanged)
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
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    interests: { type: [String], default: [] },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
      default: "prefer not to say",
    },
    occupation: {
      type: String,
      enum: ["Student", "Working", "Prefer not to say"],
      required: true,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "professor",
      immutable: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
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
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        default: [],
      },
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

    // Professor-specific fields
    institution: {
      name: { type: String, required: true, trim: true },
      department: { type: String, required: true, trim: true },
      id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\.edu$/, "Institution email must end with .edu"],
      },
      yearsOfExperience: {
        type: Number,
        required: true,
        min: 0,
      },
      designation: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true } // Enable built-in timestamps
);

// Update timestamp pre-save hook
professorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Professor = mongoose.model("Professor", professorSchema);
export default Professor;
