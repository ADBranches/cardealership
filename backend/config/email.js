/**
 * Email provider configuration contract.
 *
 * This module centralizes transactional email provider settings without
 * sending email or exposing credentials.
 *
 * Supported provider options:
 * - pending
 * - nodemailer
 * - sendgrid
 *
 * Provider transport is intentionally not connected until the email delivery configuration is approved.
 */

export const SUPPORTED_EMAIL_PROVIDERS = ["pending", "nodemailer", "sendgrid"];

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

export function getEmailProvider() {
  const provider = process.env.EMAIL_PROVIDER || "pending";

  if (SUPPORTED_EMAIL_PROVIDERS.includes(provider)) {
    return provider;
  }

  return "pending";
}

export function getRequiredEmailEnvironmentKeys(provider = getEmailProvider()) {
  if (provider === "nodemailer") {
    return NODEMAILER_REQUIRED_ENV_KEYS;
  }

  if (provider === "sendgrid") {
    return SENDGRID_REQUIRED_ENV_KEYS;
  }

  return ["EMAIL_PROVIDER", "EMAIL_FROM"];
}

export function getMissingEmailEnvironmentKeys(provider = getEmailProvider()) {
  const requiredKeys = getRequiredEmailEnvironmentKeys(provider);

  return requiredKeys.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === "";
  });
}

export function isEmailProviderConfigured(provider = getEmailProvider()) {
  if (provider === "pending") {
    return false;
  }

  return getMissingEmailEnvironmentKeys(provider).length === 0;
}

export function getEmailConfig() {
  const provider = getEmailProvider();

  return {
    provider,
    from: process.env.EMAIL_FROM || "",
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || "",
    nodemailer: {
      host: process.env.EMAIL_HOST || "",
      port: process.env.EMAIL_PORT || "",
      secure: process.env.EMAIL_SECURE === "true",
      userConfigured: Boolean(process.env.EMAIL_USER),
      passwordConfigured: Boolean(process.env.EMAIL_PASSWORD),
    },
    sendgrid: {
      apiKeyConfigured: Boolean(process.env.SENDGRID_API_KEY),
    },
    missingEnvironmentKeys: getMissingEmailEnvironmentKeys(provider),
    ready: isEmailProviderConfigured(provider),
  };
}

export function getRedactedEmailConfig() {
  const config = getEmailConfig();

  return {
    provider: config.provider,
    fromConfigured: Boolean(config.from),
    replyToConfigured: Boolean(config.replyTo),
    nodemailer: {
      hostConfigured: Boolean(config.nodemailer.host),
      portConfigured: Boolean(config.nodemailer.port),
      secure: config.nodemailer.secure,
      userConfigured: config.nodemailer.userConfigured,
      passwordConfigured: config.nodemailer.passwordConfigured,
    },
    sendgrid: {
      apiKeyConfigured: config.sendgrid.apiKeyConfigured,
    },
    missingEnvironmentKeys: config.missingEnvironmentKeys,
    ready: config.ready,
  };
}
