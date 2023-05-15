const ContactUs=require('../models/contactUs')
const nodemailer=require('nodemailer')
const contactUs=async(req,res)=>{
    try {
        const { email, subject, message } = req.body;
  
        const contact = new ContactUs({ email, subject, message });
       if(req.user.email==email){

await contact.save();
const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "forzflix@gmail.com",
            pass: "ysgvwkfhfvpzupmy",
          },
        });
// Compose the email
const mailOptions = {
  from: req.user,
  to: "forzflix@gmail.com",
  subject: "New query from contact form",
  text: `Email: ${email}\nSubject: ${subject}\nMessage: ${message}`,
};

// Send the email
await transport.sendMail(mailOptions);
console.log(mailOptions)
res.status(200).json({ message: "Query sent successfully" });

       }else{
        return res.status(404).send({status:false,msg:"No user with this email address"})
       }
           } catch (error) {
        console.error(error)
    }
}

module.exports={contactUs}