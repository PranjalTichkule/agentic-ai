export interface InputGuardrailResult {
  allowed: boolean;
  reason?: string;
}

const MAX_INPUT_LENGTH = 5000;

export function validateInput(
  message: string
): InputGuardrailResult {

  // Check whether input exists
  if (!message || typeof message !== "string") {
    return {
      allowed: false,
      reason: "Message is required.",
    };
  }

  // Remove unnecessary whitespace
  const trimmedMessage = message.trim();

  // Check for empty input
  if (trimmedMessage.length === 0) {
    return {
      allowed: false,
      reason: "Message cannot be empty.",
    };
  }

  // Prevent excessively large input
  if (trimmedMessage.length > MAX_INPUT_LENGTH) {
    return {
      allowed: false,
      reason: `Message is too long. Maximum length is ${MAX_INPUT_LENGTH} characters.`,
    };
  }

  return {
    allowed: true,
  };
}