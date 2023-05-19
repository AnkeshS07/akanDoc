const multer =require('multer')
const path=require('path')
const { ObjectId } = require("mongodb");

const imageExtensionList = [
  'jpg',
  'jpeg',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'tiff',
  'dib',
  'ico',
  'cur',
  'xbm',
  'tiff',
  'tif',
  'bmp',
  'bmpf',
  'ico',
];

const imageFilter = (req, file, cb) => {
  // Get the file extension
  const fileExtension = file.originalname.split('.').pop().toLowerCase();

  // Check if the file extension is in the allowed list
  if (imageExtensionList.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb('Please upload only image files with allowed extensions: ' + imageExtensionList.join(', '), false);
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

  