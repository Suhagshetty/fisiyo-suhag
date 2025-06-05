import mongoose from "mongoose";


const basePostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
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
        maxlength: 20,
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { discriminatorKey: "postType" }
);
 
const Post = mongoose.model("Post", basePostSchema);
 
const Article = Post.discriminator(
  "Article",
  new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    featuredImage: String,
    readingTime: Number,
    isEdited: { type: Boolean, default: false },
  })
);
 
const Discussion = Post.discriminator(
  "Discussion",
  new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    attachments: [String], 
  })
); 


const QnA = Post.discriminator(
  "QnA",
  new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    question: { type: String, required: true, trim: true, maxlength: 1000 },
    acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    isAnswered: { type: Boolean, default: false },
    bounty: { type: Number, default: 0 },
  })
);


const Poll = Post.discriminator(
  "Poll",
  new mongoose.Schema({
    question: { type: String, required: true, trim: true, maxlength: 200 },
    options: [
      {
        text: { type: String, required: true, trim: true, maxlength: 100 },
        voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    allowMultipleVotes: { type: Boolean, default: false },
    endsAt: Date,
    totalVotes: { type: Number, default: 0 },
    isClosed: { type: Boolean, default: false },
  })
);
 
basePostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
 
Poll.schema.path("options").validate(function (options) {
  return options.length >= 2 && options.length <= 6;
}, "Poll must have between 2-6 options");
 

basePostSchema.index({ author: 1, community: 1 });
basePostSchema.index({ createdAt: -1 });
QnA.schema.index({ isAnswered: 1 });
Poll.schema.index({ endsAt: 1 });

export { Post, Article, Discussion, QnA, Poll };

 