/**
 * Email provider configuration contract.
 *
 * This file intentionally does not send email yet.
 * It defines the environment variables required once the team confirms
 * whether Nodemailer, SendGrid, or another transactional provider will be used.
 */

export const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "pending";

export const NODEMAILER_REQUIRED_ENV_KEYS = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "EMAIL_FROM",
];

export const SENDGRID_REQUIRED_ENV_KEYS = [
  "SENDGRID_API_KEY",
  "EMAIL_FROM",
];

export function getEmailConfig() {
  return {
    provider: EMAIL_PROVIDER,
    from: process.env.EMAIL_FROM || "",
    nodemailer: {
      host: process.env.EMAIL_HOST || "",
      port: process.env.EMAIL_PORT || "",
      user: process.env.EMAIL_USER || "",
      passwordConfigured: Boolean(process.env.EMAIL_PASSWORD),
    },
    sendgrid: {
      apiKeyConfigured: Boolean(process.env.SENDGRID_API_KEY),
    },
  };
}

export function getRequiredEmailEnvironmentKeys(provider = EMAIL_PROVIDER) {
  if (provider === "nodemailer") {
    return NODEMAILER_REQUIRED_ENV_KEYS;
  }

  if (provider === "sendgrid") {
    return SENDGRID_REQUIRED_ENV_KEYS;
  }

  return [
    "EMAIL_PROVIDER",
    "EMAIL_FROM",
  ];
}
