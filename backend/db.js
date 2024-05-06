const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

connectDB();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
