const multer = require("multer");
const path = require("path");


//==========================================================================================================================//
/* This code is configuring the storage and filename settings for the multer middleware */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "file") { 
      cb(null, path.join(__dirname, "../../uploads"));
    } else {
      cb(null, path.join(__dirname, "../../uploads"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let filename;

    if (file.fieldname === "file") {
      const extension = path.extname(file.originalname);
      filename = "document" + uniqueSuffix + extension;
    } else {
      const extension = path.extname(file.originalname);
      filename = "profile" + uniqueSuffix + extension;
    }

    cb(null, filename);
  },
});

const uploadDoc = multer({ storage });

//=======================================================================================================================//
module.exports = uploadDoc;
