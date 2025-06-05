import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community", 
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    votes: {
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, 
  },
  {
    timestamps: true,
  }
);
 
postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
 
postSchema.index({ author: 1, community: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
