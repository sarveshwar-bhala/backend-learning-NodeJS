const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP Connection Failed:', error);
      } else {
        console.log('✅ SMTP Server Ready!');
      }
    });

    console.log('✅ Transporter created, sending email...');

    const mailOptions = {
      from: 'Sarveshwar <sarveshwar@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message, // ✅ Fixed `test` → `text`
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
