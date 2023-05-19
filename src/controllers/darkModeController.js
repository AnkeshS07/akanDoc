const darkModeModel = require('../models/darkMode');

const darkMode = async (req, res) => {
  try {
    const { darkMode } = req.body;

    if (typeof darkMode !== 'boolean') {
      return res.status(400).json({ status: 400, data: {}, message: "Invalid request: darkMode must be a boolean" });
    }

   let data= await darkModeModel.updateOne({}, { darkMode });

    return res.status(200).json({ status: 200, data, message: "Dark Mode set successfully" });
  } catch (error) {
    console.error('Error during darkMode:', error);
    return res.status(500).json({ status: 500, message: 'An error occurred during the request' });
  }
};


const getDarkMode = async (req, res) => {
    try {
     
  
     let data= await darkModeModel.findOne();
  
      return res.status(200).json({ status: 200, data, message: "Dark Mode get successfully" });
    } catch (error) {
      console.error('Error during darkMode:', error);
      return res.status(500).json({ status: 500, message: 'An error occurred during the request' });
    }
  };
module.exports = { darkMode ,getDarkMode};
