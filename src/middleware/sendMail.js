const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const providerModel=require('../models/provider')
const jwt = require("jsonwebtoken");
// const sendEmail = async (req, res) => {
//   try {
//     const userData = req.body.email;
//     if(userData.length==0){
//       return res.status(404).send({status:false,msg:'email address can not empty'})

//     }
//     const otp = Math.floor(1000 + Math.random() * 9000);
//     console.log(otp);

//     // let user = await userModel.findOne({ email: userData });
//     // if (user!==null) {
//     //   user.otp = otp;
//     //   await user.save();
//     //   }else{
//     //     return res.status(404).send({status:false,msg:'no user found with this email address'})
//     //   }

//     const transport = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "forzflix@gmail.com",
//         pass: "ysgvwkfhfvpzupmy",
//       },
//     });

//     const mailoption = {
//       from: "forzflix@gmail.com",
//       to: userData,
//       subject: "Send OTP to your email",
//       text: `Your Zflix OTP is: ${otp}. Please don't share it with anyone for your safety.`,
//     };

//     transport.sendMail(mailoption);
//     res.status(200).json({
//       message: "Data is successfully saved, and the mail is sent.",
//       status: 200,
//     });
//     next()
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       message: "Data not saved.",
//       status: 400,
//     });
//   }
// };


const resendEmailOtp = async (req, res,next) => {
  try {
    const userData = req.body.email;
    const findUser=await userModel.findOne({email:userData})
    console.log(userData)
    if (userData==undefined){
 return res.status(400).send({status:false,msg:'email can not be empty'})
    }
  
    const otp = Math.floor(1000 + Math.random() * 9000);

    let user = await userModel.findOne({ email: userData ,password:findUser.password,device_id:req.headers.device_id});
      console.log(user,"user")

    if (user) {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "forzflix@gmail.com",
          pass: "ysgvwkfhfvpzupmy",
        },
      });
  
      const mailoption = {
        from: "forzflix@gmail.com",
        to: userData,
        subject: "Send OTP to your email",
        text: `Your AkanDoc OTP is: ${otp}. Please don't share it with anyone for your safety.`,
      };
      console.log(mailoption)
      transport.sendMail(mailoption); 
      user.otp=otp
      user.save()
      console.log(user)
      
      return res.status(200).send({
        status:200,
        data:{user},
        message:"Otp resend Success"
      })
 
    }else{
      return res.status(400).send({
        status:400,
        data:{},
        message:"Invalid details"
      })
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Data not saved.",
      status: 400,
    });
  }
};
const resendProviderEmailOtp = async (req, res,next) => {
  try {
    const userData = req.body.email;
    const findUser=await providerModel.findOne({email:userData,'device_info.device_id':req.headers.device_id})
    if(!findUser){
      return res.status(400).send({status:400,message:'User Not Found'})

    }
    console.log(userData)
    if (userData==undefined){
 return res.status(400).send({status:400,message:'email can not be empty'})
    }
  
    const otp = Math.floor(1000 + Math.random() * 9000);

    let user = await providerModel.findOne({ email: userData ,password:findUser.password});
      console.log(user,"user")

    if (user) {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "forzflix@gmail.com",
          pass: "ysgvwkfhfvpzupmy",
        },
      });
  
      const mailoption = {
        from: "forzflix@gmail.com",
        to: userData,
        subject: "Send OTP to your email",
        text: `Your AkanDoc OTP is: ${otp}. Please don't share it with anyone for your safety.`,
      };
      console.log(mailoption)
      transport.sendMail(mailoption); 
      user.otp=otp
      user.save()
      console.log(user)
      
      return res.status(200).send({
        status:200,
        data:{user},
        message:"Otp resend Success"
      })
 
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Data not saved.",
      status: 400,
    });
  }
};


const verifySignUpOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
        console.log(otp.length,otp)
   
    const user = await userModel.findOne({ email, otp }).maxTimeMS(30000);
    console.log("userrrrrrr",user);
    if (!user) {
      return res.status(400).json({
        message: "No user found with this email address",
        status: 400,
      });
    }

    let token = jwt.sign(
      {
        userId: user._id.toString(),
        project: "Z-Flix",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "Z-Flix!@#%"
    );

    res.status(200).json({
      status: 200,
      message: "OTP verified successfully",
      token: token,
    });
    user.otp = -1;
    user.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};


const sendEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: false, msg: 'Email address cannot be empty' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);

    // Save the OTP to the user model or perform any other necessary operations

    const transport = nodemailer.createTransport({
      host: " mail.alcax.com", // Replace with the actual SMTP server hostname
      port: 587, // Replace with the actual port number
      secure: false,
      auth: {
        user: "smtp@alcax.com", // Replace with the actual username
        pass: "1z&7wBOOP7tO", // Replace with the actual password
      },
    });

    const mailOptions = {
      from: "smtp@alcax.com", // Replace with the actual "from" email address
      to: email,
      subject: "Send OTP to your email",
      text: `Your akanDoc OTP is: ${otp}. Please don't share it with anyone for your safety.`,
    };

    await transport.sendMail(mailOptions);
    next();

    res.status(200).json({
      message: "Data is successfully saved, and the email is sent.",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Data not saved or error occurred while sending the email.",
      status: 400,
    });
  }
};



module.exports = {resendEmailOtp ,resendProviderEmailOtp,verifySignUpOTP,sendEmail};
