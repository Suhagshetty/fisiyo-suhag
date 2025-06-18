import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "post_disapproved",
      "post_approved",
      "new_message",
      "community_update",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  postTitle: {
    // New field: title of the related post
    type: String, 
  },
  imageUrl: {
    // New field: filename of the first image (if exists)
    type: String, 
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
