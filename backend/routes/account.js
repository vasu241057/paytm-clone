const express = require("express");
const { authMiddleware } = require("../middlewares");
const { Account } = require("../db");
const mongoose = require("mongoose");
const router = express.Router();

// Route to get the balance of the authenticated user's account
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.userId });
    res.json({ balance: account.balance });
  } catch (err) {
    console.error(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server Error" });
  }
});

// Route to transfer funds from the authenticated user's account to another account
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { amount, to } = req.body;

  try {
    const account = await Account.findOne({ userId: req.user.userId }).session(
      session
    );
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid account" });
    }

    await Account.updateOne(
      { userId: req.user.userId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Transfer successful" });
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server Error" });
  } finally {
    session.endSession();
  }
});

module.exports = router;
