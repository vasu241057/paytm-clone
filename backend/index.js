const express = require("express");
const mainRouter = require("./routes/");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1", mainRouter);

app.listen(port, () => {
  console.log("welcome to serve");
});
