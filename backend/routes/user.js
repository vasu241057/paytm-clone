const express = require("express");
const { User, Account } = require("../db");
const { z } = require("zod");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const JWT_secret = require("../config");
const { authMiddleware } = require("../middlewares");
const router = express.Router();

// Zod schema for user registration
const userSchema = z.object({
  username: z.string().min(3).max(255).trim(),
  password: z.string().min(6).max(20).trim(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
});

// Zod schema for updating user information
const updateBody = z.object({
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Route for user registration
router.post("/signup", async (req, res) => {
  try {
    const validUser = userSchema.safeParse(req.body);
    if (!validUser.success) {
      return res.status(400).json(validUser.error.issues);
    }

    const { username } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw createError(409, "Username already exists");
    }

    const newUser = new User(req.body);
    await newUser.save();
    const userID = newUser._id;

    await Account.create({
      userId: userID,
      balance: 1 + Math.random() * 10000,
    });

    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, JWT_secret);
    res.json({ token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Username already exists" });
    }
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server Error" });
  }
});

// Route for user login
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      throw createError(401, "invalid credentials");
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      throw createError(401, "invalid credentials");
    }

    const payload = { userID: user._id };
    const token = jwt.sign(payload, JWT_secret);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server Error" });
  }
});

// Route for updating user information
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { success } = updateBody.parse(req.body);
    if (!success) {
      res.status(400).json({ message: "invalid Fields" });
    }
    await User.updateOne({ _id: req.user.userId }, req.body);
    res.json({ message: "updated successfully" });
  } catch (err) {
    console.error(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server Error" });
  }
});

// Route for bulk user search
router.get("/bulk", authMiddleware, async (req, res) => {
  try {
    const filter = req.query.filter || "";
    const users = await User.find({
      $or: [
        { firstName: { $regex: `^${filter}`, $options: "i" } },
        { lastName: { $regex: `^${filter}`, $options: "i" } },
      ],
    });
    res.json(users);
  } catch (err) {
    console.error("Error finding users:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
