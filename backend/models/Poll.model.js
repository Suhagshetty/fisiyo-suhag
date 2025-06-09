import mongoose from "mongoose";

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

    // Voting logic
    totalVotes: {
      type: Number,
      default: 0,
    },
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },

    // Poll Type: Standard or Quiz
    pollType: {
      type: String,
      enum: ["standard", "quiz"],
      default: "standard",
    },

    // Quiz fields
    correctOptionIndexes: {
      type: [Number], // Indexes of correct options
      default: [],
    },
    showCorrectOption: {
      type: Boolean,
      default: false,
    },

    // Results visibility
    showVotesBeforeExpire: {
      type: Boolean,
      default: true,
    },

    // Expiry
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from creation
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
pollSchema.index({ community: 1, createdAt: -1 });

// Instance method to check if expired
pollSchema.methods.hasExpired = function () {
  return new Date() > this.expiresAt;
};

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
