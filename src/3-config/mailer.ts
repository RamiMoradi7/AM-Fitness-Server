import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const contactMail = async (
  senderMail: string,
  subject: string,
  text: string
) => {
  try {
    const info = await transporter.sendMail({
      from: senderMail,
      to: process.env.EMAIL_USER,
      subject,
      text,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send Email.");
  }
};

export const resetPasswordMail = async (
  receiverMail: string,
  subject: string,
  text: string
) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiverMail,
      subject,
      text,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send Email.");
  }
};
