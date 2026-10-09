import { getEmailConfig } from "../config/email.js";
import { createEmailVerificationMessage } from "../templates/emailVerification.js";

export function buildVerificationUrl(token) {
  const siteUrl = (process.env.SITE_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${siteUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

async function deliverWithSendGrid(config, message, recipient, fetcher = fetch) {
  const response = await fetcher("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ personalizations: [{ to: [{ email: recipient }] }], from: { email: config.from }, subject: message.subject, content: [{ type: "text/plain", value: message.text }, { type: "text/html", value: message.html }] }),
  });
  if (!response.ok) throw new Error("EMAIL_DELIVERY_FAILED");
  return { accepted: true, provider: "sendgrid" };
}

async function deliverWithNodemailer(config, message, recipient, transporterFactory) {
  const factory = transporterFactory ?? (await import("nodemailer")).default.createTransport;
  const transporter = factory({ host: config.nodemailer.host, port: Number(config.nodemailer.port), secure: config.nodemailer.secure, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } });
  await transporter.sendMail({ from: config.from, replyTo: config.replyTo, to: recipient, ...message });
  return { accepted: true, provider: "nodemailer" };
}

export async function sendEmailVerification({ recipient, name, token, fetcher, transporterFactory }) {
  const config = getEmailConfig();
  const verificationUrl = buildVerificationUrl(token);
  const message = createEmailVerificationMessage({ name, verificationUrl });
  if (!config.ready) return { accepted: false, provider: config.provider, reason: "EMAIL_PROVIDER_NOT_CONFIGURED" };
  if (config.provider === "sendgrid") return deliverWithSendGrid(config, message, recipient, fetcher);
  if (config.provider === "nodemailer") return deliverWithNodemailer(config, message, recipient, transporterFactory);
  return { accepted: false, provider: config.provider, reason: "EMAIL_PROVIDER_NOT_CONFIGURED" };
}
