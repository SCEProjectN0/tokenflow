import nodemailer from "nodemailer";
import type { ContactMessage } from "./db";

const toEmail = process.env.CONTACT_TO_EMAIL || "vyacheslavrovensky@gmail.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.includes("PASTE_YOUR_GOOGLE_APP_PASSWORD_HERE")) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

export async function sendContactEmail(message: ContactMessage) {
  const safeName = escapeHtml(message.name);
  const safeEmail = escapeHtml(message.email);
  const safeBody = escapeHtml(message.message).replace(/\n/g, "<br />");

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact" <${getRequiredEnv("SMTP_USER")}>`,
    replyTo: message.email,
    to: toEmail,
    subject: `Portfolio message from ${message.name}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      `Sent: ${message.createdAt}`,
      "",
      message.message,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>New portfolio message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Sent:</strong> ${message.createdAt}</p>
        <hr />
        <p>${safeBody}</p>
      </div>
    `,
  });
}
