const multer =require('multer')
const path=require('path')
const { ObjectId } = require("mongodb");
const imageFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
    } else {
      cb("Please upload only image file.", false);
    }
  };
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
      },
      
  
    filename: (req, file, cb) => {
    let galleryId = new ObjectId();
      let gallery = 'profile'+galleryId+path.extname(file.originalname);
      req.file = gallery
      cb(null, gallery);
    }
  });
  var uploadFile = multer({ storage: storage, fileFilter: imageFilter });

  module.exports={uploadFile}

  