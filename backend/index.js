import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/createPost.js"
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
    methods: ["POST", "GET", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/users", userRoutes);
app.use("/api", postRoutes);
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
  

app.get("/", (req, res) => {
  res.send("Welcome to the Express app!");
});
