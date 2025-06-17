import mongoose from "mongoose";
import Community from "./community.model.js";
const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        isCorrect: Boolean,
      },
    ],
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
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    communityHandle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    community_dp: {
      type: String,
      required: true,
    },
    votes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      selectedOptions: {
        type: [Number],
        required: true
      }
    }],
    totalVotes: {
      type: Number,
      default: 0,
    },
    votedUsers: [{
      type: mongoose.Schema.Types.Mixed,
      ref: 'User'
    }],
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    pollType: {
      type: String,
      enum: ["standard", "quiz"],
      default: "standard",
    },
    correctOptionIndexes: {
      type: [Number],
      default: [],
      validate: {
        validator: function (v) {
          return this.pollType !== "quiz" || v.length > 0;
        },
        message: "At least one correct option is required for quizzes",
      },
    },
    showCorrectOption: {
      type: Boolean,
      default: false,
    },
    showVotesBeforeExpire: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for time remaining
pollSchema.virtual("timeRemaining").get(function () {
  return Math.max(0, this.expiresAt - Date.now());
});

// Check if poll is expired
pollSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt;
};

// Update isActive status before save
pollSchema.pre("save", function (next) {
  this.isActive = !this.isExpired();
  next();
});

// Auto-deactivate expired polls
pollSchema.post("find", function (docs) {
  docs.forEach((doc) => {
    if (doc.isExpired() && doc.isActive) {
      doc.isActive = false;
      doc.save();
    }
  });
});

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
