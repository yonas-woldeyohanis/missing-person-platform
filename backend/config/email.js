const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter configured for Gmail
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    // FIX: Automatically set secure to true if port is 465
    secure: process.env.EMAIL_PORT == 465,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // FIX: Add this to prevent handshake errors in cloud environments
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `"Aberus Platform" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
