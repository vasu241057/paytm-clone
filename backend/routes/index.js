const express = require("express");
const userRouter = require("./user");

const router = express.Router();
Router.use("/user", userRouter);

module.exports = router;
