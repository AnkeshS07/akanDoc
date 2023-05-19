const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/userRoute.js");
const dashboardRoutes=require('./routes/dashBoardRoute.js')
const { default: mongoose } = require("mongoose");
const Exception  = require('../src/exceptions/HTTPExceptionHandler.js');
mongoose.set('strictQuery', true)

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
mongoose
  .connect(
    "mongodb+srv://AnkeshSh07:Ny4Y2QcGUU665ifF@cluster0.62uqo.mongodb.net/akanDoc",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));
app.use("/", route);
app.use('/api/dashboard', dashboardRoutes)
app.use(Exception.handler);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
