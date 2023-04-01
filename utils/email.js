const nodemailer = require('nodemailer');
const Mailjet = require('node-mailjet');

// const nodemailerSendgrid = require('nodemailer-sendgrid');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Akhil Augustin <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      // return nodemailer.createTransport(
      //   nodemailerSendgrid({
      //     apiKey: process.env.SENDGRID_PASSWORD,
      //   })
      // );
      // return nodemailer.createTransport({
      //   // service: 'SendGrid',
      //   host: 'smtp.sendgrid.net',
      //   port: 25,
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });
      // Mailjet
      // return nodemailer.createTransport({
      //   host: process.env.MAILJET_HOST,
      //   port: process.env.MAILJET_PORT,
      //   auth: {
      //     user: process.env.MAILJET_API_KEY,
      //     pass: process.env.MAILJET_SECRET_KEY,
      //   },
      // });
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    if (process.env.NODE_ENV === 'development') {
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html),
      };

      // 3) Create a transport and send emaiol
      await this.newTransport().sendMail(mailOptions);
    } else {
      // Mailjet new
      const mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY
      );
      const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'akhiljw46@gmail.com',
              Name: 'Akhil Augustin',
            },
            To: [
              {
                Email: this.to,
                Name: this.firstName,
              },
            ],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
      request
        .then((result) => {
          console.log(result.body);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
