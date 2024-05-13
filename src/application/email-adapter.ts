import nodemailer from "nodemailer";
import { APP_EMAIL, APP_EMAIL_PASS } from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_EMAIL_PASS,
  },
});

export const emailsAdapter = {
  async sendEmail(email: string, subject: string, html: string) {
    const result = await transporter.sendMail({
      from: `Metropolitan Gossiper <${process.env.APP_EMAIL}>`,
      to: email,
      subject,
      html,
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
      throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
  },
};
