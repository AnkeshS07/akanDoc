const bookingModel=require('../models/notification')
const HttpResponse = require("../response/HttpResponse");
const providerModel=require('../models/provider')
const userModel=require('../models/userModel')

const sendNotificationToDoctor=require('../common/notification').sendNotificationToDoctor;

const bookNow=async(req,res,next)=>{
    try {
        const {healthComplaint,specialist,description,selectedDateTime,userId,doctorId}=req.body
      
        const isUserExist=await userModel.findById({_id:req.checkIfExist._id})
        
      

        const doctorData=await providerModel.findById({_id:doctorId})
   
    console.log(doctorData)
        if(!isUserExist){
            return HttpResponse.apiResponse(
                res,
                {},
                HttpResponse.HTTP_NOT_FOUND,
                "No user found with this email address."
              );
        }
        if(!doctorData){
          return HttpResponse.apiResponse(
              res,
              {},
              HttpResponse.HTTP_NOT_FOUND,
              "No Dr. found."
            );
      }
       

        const bookRequest=await bookingModel.create({healthComplaint,specialist,description,selectedDateTime,doctorId})
       

        bookRequest.userId=req.checkIfExist._id

        bookRequest.save()
        const notificationMessage = {desc:req.body.description,healthComplaint:healthComplaint,date:selectedDateTime};
        console.log("notificationMessage",notificationMessage)

        sendNotificationToDoctor(doctorId, notificationMessage)
        .then(() => {
          return HttpResponse.apiResponse(
            res,
            { bookRequest, doctorData },
            HttpResponse.HTTP_CREATED,
            "Request sent successfully."
          );
        })
        .catch((error) => {
          return HttpResponse.apiResponse(
            res,
            {},
            error.status || HttpResponse.HTTP_INTERNAL_SERVER_ERROR,
            error.message || "Error sending notification."
          );
        });
    } catch (err) {
      err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
      next(err);
    }
  };
module.exports={bookNow}


