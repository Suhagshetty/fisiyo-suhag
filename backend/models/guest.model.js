import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  profilePicture: String, // Now stores full Supabase URL
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer not to say"],
    required: true,
  },
  phoneNumber: {
    type: String, 
    required: true
  },
  occupation: {
    type: String,
    enum: ["Student", "Working", "Prefer not to say"],
    required: true,
  },
  interests: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
