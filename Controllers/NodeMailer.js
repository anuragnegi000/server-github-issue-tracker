const UserModel = require("../Models/Users");

const nodemailer = require('nodemailer');

const express = require("express");
require('dotenv').config();
const router = express.Router();

router.post("/sendmail", async (req, res) => {
  console.log(req.body);
  const {email,repo_name,issue_url} = req.body;
  let user = await UserModel.findOne({ email: email });
  console.log("email is ",email,"user is ",user);
  if(!user){
    res.status(400).json({message:"User not found"});
  }
  const auth = nodemailer.createTransport({
    host:"mail.privateemail.com",
    secure: true,
    port: 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_KEY,
    },
  });
  const receiver = {
    from: process.env.MAIL_USER,
    to: email,
    subject: `NEW ISSUE - ${repo_name}`,
    text: `Link to new issue is - ${issue_url}`,
  };
  console.log("reached nodemailer");
  auth.sendMail(receiver, (error, emailResponse) => {
    if (error) {
      console.error(error ? error.message : "Unknown error occurred");
      res.end("Error sending email");
    } else {
      console.log("Email sent successfully: " + emailResponse.response);
      res.end("Email sent successfully");
    }
  });
});

module.exports = router;

