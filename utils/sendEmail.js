// const nodeMailer = require("nodemailer");

// const sendEmail = async (options) => {
//   const transporter = nodeMailer.createTransport({
//     host: process.env.SMPT_HOST,
//     // port: process.env.SMPT_PORT,
//     service: process.env.SMPT_SERVICE,
//     auth: {
//       user: process.env.SMPT_MAIL,
//       pass: process.env.SMPT_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: process.env.SMPT_MAIL,
//     to: options.email,
//     subject: options.subject,
//     html: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = {sendEmail};

const { ServerClient } = require('postmark');

const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN);


const sendEmail = async (options) => {
  try {
    const message = {
      From: process.env.POSTMARK_SENDER_EMAIL,
      To: options.email,
      Subject: options.subject,
      HtmlBody: options.message,
    };

    await postmarkClient.sendEmail(message);

    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendEmail };
