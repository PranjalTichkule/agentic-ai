export interface OutputGuardrailResult {
  allowed: boolean;
  reason?: string;
}

const MAX_OUTPUT_LENGTH = 10000;

export function validateOutput(
  response: string
): OutputGuardrailResult {

  // 1. Check response exists
  if (!response || typeof response !== "string") {
    return {
      allowed: false,
      reason: "Agent response is empty.",
    };
  }

  // 2. Remove unnecessary whitespace
  const trimmedResponse = response.trim();

  // 3. Check empty response
  if (trimmedResponse.length === 0) {
    return {
      allowed: false,
      reason: "Agent response is empty.",
    };
  }

  // 4. Prevent excessively large response
  if (trimmedResponse.length > MAX_OUTPUT_LENGTH) {
    return {
      allowed: false,
      reason:
        `Agent response is too long. Maximum length is ${MAX_OUTPUT_LENGTH} characters.`,
    };
  }

  // 5. Check for obvious internal errors
  const suspiciousPatterns = [
    "API_KEY=",
    "DATABASE_PASSWORD=",
    "Tool execution failed:",
  ];

  for (const pattern of suspiciousPatterns) {
    if (trimmedResponse.includes(pattern)) {
      return {
        allowed: false,
        reason:
          "Agent response contains potentially sensitive internal information.",
      };
    }
  }

  return {
    allowed: true,
  };
}