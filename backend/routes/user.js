const express = require("express");
const { User } = require("../db");
const { z } = require("zod");
const createError = require("http-errors");
const JWT_secret = require("../config");
const { authMiddleWares } = require("../middlewares");

const router = express.Router();

const userSchema = z.object({
  username: z.string().min(3).max(255).trim(),
  password: z.string().min(6).max(20).trim(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.post("/signup", async (req, res) => {
  try {
    // const { username, password } = req.body;
    const validUser = userSchema.safeParse(req.body);
    if (!validUser.success) {
      return res.status(400).json(validUser.error.issues);
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw createError(409, "Username already exists ");
    }
    const newUser = new User(req.body);
    await newUser.save();

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

router.put("/", authMiddleWares, async (req, res) => {
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

app.get("/bulk", async (req, res) => {
  try {
    const filter = req.query.filter;
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

// const { authMiddleware } = require("./middleware");

// router.put("/", authMiddleware, async (req, res) => {
//   const { success, data } = updateBody.safeParse(req.body);

//   if (!success) {
//     return res.status(400).json({
//       message: "Error while updating information"
//     });
//   }

//   try {
//     await User.updateOne(
//       { _id: req.userId },
//       { $set: { ...data } }
//     );

//     res.json({
//       message: "Updated successfully"
//     });
//   } catch (err) {
//     console.error('Error updating user:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });
