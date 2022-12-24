/* eslint-disable camelcase */
/* eslint-disable space-before-function-paren */
/* eslint-disable require-jsdoc */
import "dotenv/config";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
const { EMAIL_USERNAME, EMAIL_PASSWORD, NODE_ENV } = process.env;

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
        host: "smtp.mailgun.org",
        port: 465,
        auth: {
          user: "audiophile@sandbox4d0c845af95e4f178a6a14514cdcd471.mailgun.org",
          pass: "ceb81ddbafbcfa5117371725384bdeac-eb38c18d-b916eeba",
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
