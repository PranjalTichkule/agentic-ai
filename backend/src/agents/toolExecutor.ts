import toolRegistry from "../tools/toolRegistry";

const executeTool = async (
  toolName: string,
  arguments_: any
) => {
  const tool = toolRegistry[toolName];

  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  console.log(`Executing tool: ${toolName}`);
  console.log("Arguments:", arguments_);

  const result = await tool(arguments_);

  console.log("Tool result:", result);

  return result;
};

export default executeTool;