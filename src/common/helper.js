
const nodemailer = require("nodemailer");
/**
 * To generate OTP
 * @returns Integer
 */
const generateOTP = ()=>{
   return  Math.floor(1000 + Math.random() * 9000);
}

/**
 * To send otp to user 
 * @param {*} toEmail 
 * @param {*} OTP 
 * @param {*} type 
 */
const sendOTP = (toEmail, OTP, type = 'register')=>{
    let subject =    "";
    let body    =   ""
    switch (type) {
        case "login":
        case 'register':
            subject = "Account Verification"
            body = `Your akanDoc account Verifcation OTP is: ${OTP}. Please don't share it with anyone for your safety.`
            break;
        
        case 'forgotPassword':
            subject = "Forgot Password"
            body = `Your akanDoc forgot password OTP is: ${OTP}. Please don't share it with anyone for your safety.`
            break;
    
        default:
            break;
    }
    sendMail(toEmail, subject , body);
}
const sendUnAuthOTP = (toEmail, OTP, type = 'login')=>{
  let subject =    "";
  let body    =   ""
  switch (type) {
      case "login":
      case 'register':
          subject = "Account Verification"
          body = `Your Zflix account Verifcation OTP is: ${OTP}. Please don't share it with anyone for your safety.`
          break;
      
      case 'forgotPassword':
          subject = "Forgot Password"
          body = `Your Zflix forgot password OTP is: ${OTP}. Please don't share it with anyone for your safety.`
          break;
           
      case 'updatePhone':
        subject = "Update Phone"
        body = `Your AkanDoc update Phone OTP is: ${OTP}. Please don't share it with anyone for your safety.`
        break;
  
      default:
          break;
  }
  sendMail(toEmail, subject , body);
}

const sendPassForgotOTP = (toEmail, OTP, type = 'forgot')=>{
  let subject =    "";
  let body    =   ""
  switch (type) {
    
      case 'forgot':
          subject = "Account Verification"
          body = `Your Zflix account Verifcation OTP is: ${OTP}. Please don't share it with anyone for your safety.`
          break;
      
      case 'forgotPassword':
          subject = "Forgot Password"
          body = `Your Zflix forgot password OTP is: ${OTP}. Please don't share it with anyone for your safety.`
          break;
  
      default:
          break;
  }
  sendMail(toEmail, subject , body);
}

/**
 * To send email
 * @param {*} toEmail 
 * @param {*} subject 
 * @param {*} body 
 */
const sendMail = (toEmail, subject, body) => {
  
    const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "forzflix@gmail.com",
      pass: "ysgvwkfhfvpzupmy",
    },
  });

  const mailoption = {
    from: "forzflix@gmail.com",
    to: toEmail,
    subject: subject,
    text: body,
  };
  console.log(mailoption)
  transport.sendMail(mailoption);
};



module.exports = {sendOTP, sendMail, generateOTP,sendUnAuthOTP,sendPassForgotOTP };
