const userProfileModel = require("../../models/userModel");
const HttpResponse = require("../../response/HttpResponse");
const InsurancePayment=require('../../models/insurancePayment')
const { sendOTP, generateOTP } = require("../../common/helper")

//========================================User List Api============================================================//


const getAllUser = async (req, res, next) => {
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


//============================================Create User BY Admin==========================================================//

const saveUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, countryCode } = req.body;
    let OTP = generateOTP();
    let newProfile = await userProfileModel.create({
      name: name,
      email: email,

      password: password,
      otp: OTP,
      phone: phone,
      countryCode: countryCode,
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

//===============================================Get User BY admin=======================================================//

const  getUser = async (req,res,next)=>
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

//===========================================Update User By Admin===========================================================//

  const updateUser = async (req,res,next)=>
  {
    try{
      console.log(req.params.id);
   
    const updateData = req.body;

    const user=await userProfileModel.findById({_id:req.params.id})
    if(user==null){
      return res.status(404).json({status:404,data:{},message:"no user found"})
    }
    console.log(user)
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

  //==============================================Get Insurance Document Request=========================================================//
  
  const getAllPaymentRequests = async (req, res) => {
    try {
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
  
      // Calculate the skip value based on the current page and limit
      const skip = (page - 1) * limit;
  
      // Retrieve the total count of insurance payment requests
      const totalCount = await InsurancePayment.countDocuments();
  
      // Retrieve the payment requests for the current page with the specified limit
      const paymentRequests = await InsurancePayment.find({ 'class.status': 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name')
        .sort({ createdAt: -1 });
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.json({
        status: 200,
        
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        list: paymentRequests,
        message: 'Insurance payment requests retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message });
    }
  };
  

//================================================Verify/Reject Insurance By Admin=======================================================//

  const verifyPayment = async (req, res) => {
    try {
      const { paymentId } = req.params;

      const paymentRequest = await InsurancePayment.findById(paymentId);
  
      if (!paymentRequest) {
        return res.status(404).json({ status: 404, message: 'Payment request not found' });
      }
  
      paymentRequest.isPaymentVerify = true;
  
      await paymentRequest.save();
  
      res.json({ status: 200, data: paymentRequest, message: 'Payment verified successfully' });
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message });
    }
  };
//===================================================================================================================//

module.exports = {
    getAllUser,
    saveUser,
    getUser,
    updateUser,
    getAllPaymentRequests,
    verifyPayment
};
