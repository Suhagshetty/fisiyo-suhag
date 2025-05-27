import express from "express";
import User from "../models/Users.model.js";

const router = express.Router();
 
router.post("/", async (req, res) => {
  try {
    const userData = {
      userid: req.body.userid,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      interests: req.body.interests,
    };

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ userid: userId });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
