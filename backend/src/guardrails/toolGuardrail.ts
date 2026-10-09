export interface ToolGuardrailResult {
  allowed: boolean;
  reason?: string;
}

const ALLOWED_TOOLS = [
    "get_weather",
    "get_current_time",
    "add_numbers",
    "multiply_numbers",
    "convert_currency",
    "search_loan_documents"
];

export function validateToolCall(
  toolName: string,
  toolArguments: any
): ToolGuardrailResult {

  // --------------------------------------------------
  // 1. Check tool name
  // --------------------------------------------------

  if (!toolName || typeof toolName !== "string") {
    return {
      allowed: false,
      reason: "Tool name is missing.",
    };
  }

  // --------------------------------------------------
  // 2. Check whether tool is allowed
  // --------------------------------------------------

  if (!ALLOWED_TOOLS.includes(toolName)) {
    return {
      allowed: false,
      reason: `Tool '${toolName}' is not allowed.`,
    };
  }

  // --------------------------------------------------
  // 3. Check arguments
  // --------------------------------------------------

  if (
    toolArguments === null ||
    typeof toolArguments !== "object"
  ) {
    return {
      allowed: false,
      reason: "Tool arguments must be an object.",
    };
  }

  // --------------------------------------------------
  // 4. Tool-specific validation
  // --------------------------------------------------

  if (toolName === "get_weather") {

    if (
      !toolArguments.city ||
      typeof toolArguments.city !== "string"
    ) {
      return {
        allowed: false,
        reason:
          "get_weather requires a valid 'city' argument.",
      };
    }
  }

  if (toolName === "get_current_time") {

    if (
      !toolArguments.timezone ||
      typeof toolArguments.timezone !== "string"
    ) {
      return {
        allowed: false,
        reason:
          "get_current_time requires a valid 'timezone' argument.",
      };
    }
  }

  // --------------------------------------------------
  // Tool passed all checks
  // --------------------------------------------------

  return {
    allowed: true,
  };
}