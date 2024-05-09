const express = require("express");
const mainRouter = require("./routes/index");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

app.use("/api/v1", mainRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

app.get("/tasks", async (req, res) => {
  try {
    res.json({ message: "yeah" });
  } catch (err) {
    console.error(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server Error" });
  }
});

app.listen(port, () => {
  console.log("welcome to server " + port);
});
