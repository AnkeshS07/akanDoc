
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
mongoose.set('strictQuery', true)

const Exception = require("../src/exceptions/HTTPExceptionHandler.js");
require("dotenv").config();
const indexRoute = require("./routes/indexRoute.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.use("/", indexRoute);
app.use(Exception.handler);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
});
