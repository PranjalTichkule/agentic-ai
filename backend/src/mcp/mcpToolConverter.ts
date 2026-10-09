export function convertMcpToolsToGeminiTools(mcpTools: any[]) {
  return mcpTools.map((tool) => ({
    name: tool.name,
    type: "function",
    description: tool.description,
    parameters: tool.inputSchema,
  }));
}