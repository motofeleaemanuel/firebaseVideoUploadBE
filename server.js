const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoute = require("./routes/authRoute.js");
const storageRoute = require("./routes/storageRoute.js");

const app = express();
dotenv.config();
app.use(express.json({ limit: "10mb" }));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
app.use("/api/storage", storageRoute);

app.listen(5000, async () => {
  try {
    console.log(`App listening on port 5000`);
  } catch (error) {
    console.error("Failed to create server: ", error);
  }
});
