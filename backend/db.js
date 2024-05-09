const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vasu_khandelwal:HcZ2sRF061yaQYvY@vasu.6doetny.mongodb.net/shava"
    );

    console.log("yoooo");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

connectDB();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true, maxLength: 30 },
  lastName: { type: String, required: true, maxLength: 30 },
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "User",
    required: true,
  },

  balance: {
    type: Number,
    required: true,
  },
});

const Account = mongoose.model("Account", accountSchema);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  Account,
};
