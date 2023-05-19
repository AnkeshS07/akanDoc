const ContactUs=require('../models/contactUs')
const nodemailer=require('nodemailer')
const HttpResponse = require("../response/HttpResponse");
const contactUs=async(req,res,next)=>{
    try {
        const { email, subject, message } = req.body;
  
        const contact = new ContactUs({ email, subject, message });
       if(req.checkIfExist.email==email){

await contact.save();
const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "ankeshsharma420@gmail.com",
            pass: "qfwrikdqifdhkhyr",
          },
        });
// Compose the email
const mailOptions = {
  from: req.checkIfExist.email,
  to:"ankeshsharma420@gmail.com",
  subject: "New query from contact form",
  html: `<h2>New Query from Contact Form</h2>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Subject:</strong> ${subject}</p>
         <p><strong>Message:</strong> ${message}</p>`
};


// Send the email
await transport.sendMail(mailOptions);
console.log(mailOptions)
return HttpResponse.apiResponse(
  res,
  {},
  HttpResponse.HTTP_OK,
  "Query sent successfully"
);

       }else{
        return HttpResponse.apiResponse(
          res,
          {},
          HttpResponse.HTTP_NOT_FOUND,
          "User not found"
        );
       }
           } catch (err) {
            err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
            next(err);
          }
}
const providerContactUs=async(req,res,next)=>{
  try {
      const { email, subject, message } = req.body;
 console.log("proooo")
      const contact = new ContactUs({ email, subject, message });

await contact.save();
const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ankeshsharma420@gmail.com",
          pass: "qfwrikdqifdhkhyr",
        },
      });
// Compose the email
const mailOptions = {
from: email,
to:"ankeshsharma420@gmail.com",
subject: "New query from contact form",
html: `<h2>New Query from Contact Form</h2>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Subject:</strong> ${subject}</p>
       <p><strong>Message:</strong> ${message}</p>`
};


// Send the email
await transport.sendMail(mailOptions);
console.log(mailOptions)
return HttpResponse.apiResponse(
res,
{},
HttpResponse.HTTP_OK,
"mail sent successfully"
);

    
         } catch (err) {
          err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
          next(err);
        }
}
module.exports={contactUs,providerContactUs}