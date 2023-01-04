/* eslint-disable camelcase */
/* eslint-disable space-before-function-paren */
/* eslint-disable require-jsdoc */
import fs from "fs";
import "dotenv/config";
import * as path from "path";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import SMTPTransport from "nodemailer/lib/smtp-transport";
const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  NODE_ENV,
  SENDINBLUE_SMTP_Server,
  SENDINBLUE_PASSWORD,
  SENDINBLUE_Login,
} = process.env;

// EMAIL CLASS
export const Email = class {
  private to: string;
  private firstname: string;
  private url?: string;
  private from: string;

  constructor(user: { email: string; firstname: string }, url?: string) {
    this.to = user.email;
    this.firstname = user.firstname;
    this.url = url;
    this.from = "Audiophile <noreply@audiophile.com>";
  }

  private readonly newTransport = (): nodemailer.Transporter<SMTPTransport.SentMessageInfo> => {
    if (NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: SENDINBLUE_SMTP_Server,
        port: 465,
        auth: {
          user: SENDINBLUE_Login,
          pass: SENDINBLUE_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD,
        },
      });
    }
  };

  readonly send = async (template: any, subject: any) => {
    // render the html for the email

    // define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: template,
    };

    // create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  };

  readonly sendWelcome = async () => {
    await this.send(
      "<h1>Welcome To Audiophile</h1>  <h2>Your One stop Audio shop</h2>",
      "Welcome to Audiophile"
    );
  };
};

export async function sendEmail(email: string, subject: string, url: string, code: string) {
  const filePath = path.join(__dirname, "../utils/activation_email.html");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = { code };
  const htmlToSend = template(replacements);
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525, // 587
    secure: false,
    auth: {
      user: "fg7f6g7g67",
      pass: "asds7ds7d6",
    },
  });
  const mailOptions = {
    from: "noreply@yourdomain.com",
    to: email,
    subject: subject,
    text: url,
    html: htmlToSend,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", "https://mailtrap.io/inboxes/test/messages/");
}
