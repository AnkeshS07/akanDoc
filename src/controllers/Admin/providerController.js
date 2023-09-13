const userProfileModel = require("../../models/provider");;
const HttpResponse = require("../../response/HttpResponse");
const { sendOTP, generateOTP } = require("../../common/helper");

//============================================== getAllProvider ===========================================================//

const getAllProvider = async (req, res, next) => {
  try {
    let data = await userProfileModel.find().sort({ createdAt: 1 });
    
    if (!data) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "User not found"
      );
    }
    
    return HttpResponse.apiResponse(
      res,
      data,
      HttpResponse.HTTP_OK,
      "Get user success"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//============================================create Provider By Admin====================================================================//

const saveProvider = async (req, res, next) => {
  try {
  
    const { name, email, password, phone, countryCode,licensed } = req.body;
    let OTP = generateOTP();
    let newProfile = await userProfileModel.create({
      name: name,
      email: email,

      password: password,
      otp: OTP,
      phone: phone,
      countryCode: countryCode,
      licensed: licensed,
      device_info: [
        {
          device_id: "",
          device_token: null,
          jwt_token: null,
          device_type: null,
        },
      ],
    });
    newProfile.save();
    newProfile.message
    // To send verification OTP

    sendOTP(email, OTP, "register");
    // console.log(email);

    return HttpResponse.apiResponse(
      res,
      newProfile,
      HttpResponse.HTTP_CREATED,
      "User Created Successfully."
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }

}

//=========================================Get Provider BY Admin===============================================================//

const  getProvider = async (req,res,next)=>
{

  try {
    let user = await userProfileModel.findById({
      _id: req.params.id,
     
    });
    if (user) {
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_OK,
        "get user success"
      );
    } else {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "user not found"
      );
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
}

//=================================================updateProvider BY Admin============================================================//


  const updateProvider = async (req,res,next)=>
  {
    try{
      console.log(req.params.id);
   
    const updateData = req.body;

    if (updateData) {
      const updatedUser = await userProfileModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
        }
      );

      if (req.file) {
        updatedUser.userProfile = req.file.filename;
      }

      await updatedUser.save();
      return HttpResponse.apiResponse(
        res,
        updatedUser,
        HttpResponse.HTTP_OK,
        "updated successfully"
      );
    }
    } catch (err) {
      // Handle errors
      err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
      next(err.message);
    }

  } 

//===================================================================================================================//


module.exports = {
    getAllProvider,
    saveProvider,
    getProvider,
    updateProvider
};
