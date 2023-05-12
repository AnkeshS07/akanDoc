const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
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


const signUpEmail = async (req, res,next) => {
  try {
    const userData = req.body.email;
    console.log(userData)
    if (userData==undefined){
 return res.status(400).send({status:false,msg:'email con not be empty'})
    }
    const otp = Math.floor(1000 + Math.random() * 9000);

    let user = await userModel.findOne({ email: userData });
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
        text: `Your Zflix OTP is: ${otp}. Please don't share it with anyone for your safety.`,
      };
      console.log(mailoption)
      transport.sendMail(mailoption); 
      user.otp=otp
      user.save()
      console.log(user)
      
      next()

    }else if(user==null){
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
        text: `Your Zflix SingUp OTP is: ${otp}. Please don't share it with anyone for your safety.`,
      };
     console.log(mailoption)
      transport.sendMail(mailoption);
      req.otp=otp
      next()

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

module.exports = {signUpEmail ,verifySignUpOTP};
