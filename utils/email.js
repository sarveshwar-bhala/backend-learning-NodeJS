const { htmlToText } = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require("pug")

module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstName = user.name.split(' ')[0]),
      (this.url = url),
      (this.from = `Sarveshwar <sarveshwar@gmail.com>`);
  }
  newTransport() {
    if (process.env._NODE_ENV === 'production') {
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // send the actual email
    // 1. Render html for email based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText(html),
    };

    // 3. Create a transport and send Email
    await this.newTransport().sendMail(mailOptions);
    
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the family');
  }
  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
  }
};

// const sendEmail = async (options) => {
//   try {
//     // transporter.verify((error, success) => {
//     //   if (error) {
//     //     console.error('❌ SMTP Connection Failed:', error);
//     //   } else {
//     //     console.log('✅ SMTP Server Ready!');
//     //   }
//     // });

//     const info = await transporter.sendMail(mailOptions);

//     return info;
//   } catch (error) {
//     throw new Error('Email sending failed');
//   }
// };

// // module.exports = sendEmail;
