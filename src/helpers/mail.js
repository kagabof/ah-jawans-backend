/* eslint-disable require-jsdoc */
import sendGridMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class MailSender {
  static async sendMail(email, username, token) {
    try {
      const message = { to: email,
        from: 'ahjawans@gmail.com',
        subject: 'Verification email',
        text: `Dear, ${username} Welcome to authors haven jawans`,
        html: `<div>Dear ${username},<br><strong>You have succesfully created your account.</strong><br></div>
        <a href="http://localhost:3000/api/users/verification/${token}">Please click here to verify your account</a>` };
      return await sendGridMail.send(message);
    } catch (error) {
      return 'Email was not sent use a valid email';
    }
  }
}
