import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Update with your client's origin
    methods: ["POST", "GET", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/users", userRoutes);
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;


// Connect to MongoDB        
// vish#49D470 
      
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Start server after DB connection is established
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if cannot connect
  });


app.get("/", (req, res) => {
  res.send("Welcome to the Express app!");
});
