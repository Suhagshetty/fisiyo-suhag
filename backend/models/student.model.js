import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // Base user fields
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
    role: {
      type: String,
      default: "student",
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

    // Student-specific fields
    educationLevel: {
      type: String,
      required: true,
      enum: ["School", "College"],
      trim: true,
    },
    institutionName: {
      type: String,
      required: true,
      trim: true,
    },
    institutionRegNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    currentGradeYear: {
      type: String,
      required: true,
      enum: [
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
        "1st year",
        "2nd year",
        "3rd year",
        "4th year",
        "5th year",
      ],
    },
  },
  { timestamps: true }
);

// Update timestamp pre-save hook
studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
