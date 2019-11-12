const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');

const sendEmail = catchAsync(async options => {
  // 1 Create a transporter

  // Mailtrap - the service to fake to send emails

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2 Define the email options
  const mailOptions = {
    from: 'Bastian Nguyen <hello@natour.io',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };

  // 3 Actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
