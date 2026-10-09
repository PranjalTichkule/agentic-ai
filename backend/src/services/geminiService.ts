import gemini from "../config/gemini";

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

interface GeminiInteractionOptions {
  input: any;
  tools?: any[];
  previousInteractionId?: string;
  systemInstruction?: string;
}

async function createInteraction(
  options: GeminiInteractionOptions
) {
  const request: any = {
    model: DEFAULT_MODEL,
    input: options.input,
  };

  if (options.tools) {
    request.tools = options.tools;
  }

  if (options.previousInteractionId) {
    request.previous_interaction_id =
      options.previousInteractionId;
  }

  if (options.systemInstruction) {
    request.system_instruction =
      options.systemInstruction;
  }

  return await gemini.interactions.create(request);
}

export default {
  createInteraction,
};