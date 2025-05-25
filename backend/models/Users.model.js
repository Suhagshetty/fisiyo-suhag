import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  userid: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  interests: { type: [String], default: [] },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer not to say"],
    default: "prefer not to say",
  },
  role: {
    type: String,
    enum: ["user", "professor", "moderator"],
    required: true,
    default: "user",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email"],
  },
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
