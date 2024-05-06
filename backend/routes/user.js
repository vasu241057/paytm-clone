const express = require("express");
const { User } = require("../db");

const router = express.Router();

const userSchema = z.object({
  username: z.string().min(3).max(255).trim(),
  password: z.string().min(6).max(20).trim(),
});

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const validUser = userSchema.safeParse(req.body);
    if (!validUser.success) {
      return res.status(400).json(validUser.error.issues);
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw createError(409, "Username already exists ");
    }
    const newUser = new User({ username, password });
    await newUser.save();

    const payload = { userId: newUser._id };
    const token = jwt.sign(payload);
  } catch (error) {}
});

module.exports = router;
