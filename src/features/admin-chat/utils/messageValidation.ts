// Provisional frontend message limit used until the shared backend contract is confirmed.
// The value is isolated so it can be replaced without changing composer behavior.
export const ADMIN_CHAT_MESSAGE_MAX_LENGTH = 2000;

export type AdminChatMessageValidationCode =
  | "EMPTY_MESSAGE"
  | "MESSAGE_TOO_LONG";

export type AdminChatMessageValidationResult =
  | {
      valid: true;
      message: string;
      error: null;
      code: null;
    }
  | {
      valid: false;
      message: string;
      error: string;
      code: AdminChatMessageValidationCode;
    };

// Normalizes and validates an admin reply without retaining raw invalid input.
export function validateAdminChatMessage(
  value: string,
  maximumLength = ADMIN_CHAT_MESSAGE_MAX_LENGTH,
): AdminChatMessageValidationResult {
  const message = value.trim();
  const safeMaximumLength = Math.max(1, Math.floor(maximumLength));

  if (message.length === 0) {
    return {
      valid: false,
      message: "",
      error: "Enter a message before sending.",
      code: "EMPTY_MESSAGE",
    };
  }

  if (message.length > safeMaximumLength) {
    return {
      valid: false,
      message,
      error: `Keep the message within ${safeMaximumLength} characters.`,
      code: "MESSAGE_TOO_LONG",
    };
  }

  return {
    valid: true,
    message,
    error: null,
    code: null,
  };
}
