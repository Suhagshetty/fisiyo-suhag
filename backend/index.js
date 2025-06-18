import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/createPost.js"
import commintyRoutes from "./routes/communities.js"
import pollRoutes from "./routes/Poll.js"
import NotificationRoutes from "./routes/notification.js"

import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
 
app.use("/api/users", userRoutes);
app.use("/api", postRoutes);
app.use("/api/communities", commintyRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/notifications", NotificationRoutes);
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;


// Connect to MongoDB        
// vish#49D470 
      
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
 
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
  });
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ROLE_KEY
  );


  app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { data, error } = await supabase.storage
        .from("posts")
        .upload(
          `uploads/${Date.now()}-${req.file.originalname}`,
          req.file.buffer,
          {
            contentType: req.file.mimetype,
            cacheControl: "3600",
          }
        );

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({ error: "File upload failed" });
      }

      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(data.path);

      res.json({ downloadUrl: urlData.publicUrl });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

 // BACKEND - Public route now (no auth required)
app.post("/delete", async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: "Invalid image URLs" });
    }

    // Delete each image from Supabase storage
    const deletePromises = imageUrls.map(async (imagePath) => {
      const { error } = await supabase.storage
        .from("posts")
        .remove([`uploads/${imagePath}`]);

      if (error) {
        console.error(`Error deleting image ${imagePath}:`, error);
      }
    });

    await Promise.all(deletePromises);
    res.status(200).json({ message: "Images deleted successfully" });
  } catch (err) {
    console.error("Error deleting images:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/", (req, res) => {
  res.send("Welcome to the Express app!");
});
