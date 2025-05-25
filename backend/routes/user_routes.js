import express from "express";
import User from "../models/Users.model.js"

const router = express.Router(); 


router.post("/", async (req, res) => {
  try {
    const userData = req.body;
    const user = new User(userData);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
export default router; 