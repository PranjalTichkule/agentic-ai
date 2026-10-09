import {
  getTimeMcpClient,
  getCalculatorMcpClient,
  getFinanceMcpClient,
  getRagMcpClient
} from "../mcp/mcpClient";

import { convertMcpToolsToGeminiTools } from "../mcp/mcpToolConverter";

import { Client } from "@modelcontextprotocol/client";

// --------------------------------------------------
// MCP Server Types
// --------------------------------------------------

type McpServerName = "time" | "calculator" | "finance" | "rag";

interface McpToolInfo {
  name: string;
  server: McpServerName;
}

// --------------------------------------------------
// Tool → MCP Server Mapping
// --------------------------------------------------

const toolServerMap: Record<string, McpServerName> = {
  get_current_time: "time",
  get_weather: "time",

  add_numbers: "calculator",
  multiply_numbers: "calculator",

  convert_currency: "finance",
  search_loan_documents: "rag",
};

// --------------------------------------------------
// Get MCP Client for a server
// --------------------------------------------------

async function getClient(
  server: McpServerName
): Promise<Client> {

  if (server === "time") {
    return await getTimeMcpClient();
  }

  if (server === "calculator") {
    return await getCalculatorMcpClient();
  }

  if (server === "finance") {
    return await getFinanceMcpClient();
  }

  return await getRagMcpClient();
}

// --------------------------------------------------
// Discover tools from all MCP servers
// --------------------------------------------------

async function getTools() {

  // Connect to both servers
  const timeClient =
    await getTimeMcpClient();

  const calculatorClient =
    await getCalculatorMcpClient();

const financeClient =
  await getFinanceMcpClient();

  const ragClient =
    await getRagMcpClient();

  const ragResult =
  await ragClient.listTools();

  // Discover tools from Time/Weather server
  const timeResult =
    await timeClient.listTools();

  // Discover tools from Calculator server
  const calculatorResult =
    await calculatorClient.listTools();

const financeResult =
  await financeClient.listTools();

  // Add server information to each tool
const tools: McpToolInfo[] = [
  ...timeResult.tools.map((tool: any) => ({
    ...tool,
    server: "time" as McpServerName,
  })),

  ...calculatorResult.tools.map((tool: any) => ({
    ...tool,
    server: "calculator" as McpServerName,
  })),

  ...financeResult.tools.map((tool: any) => ({
    ...tool,
    server: "finance" as McpServerName,
  })),

  ...ragResult.tools.map((tool: any) => ({
    ...tool,
    server: "rag" as McpServerName,
  })),
];

  console.log(
    "Tools discovered from all MCP servers:"
  );

  console.log(
    JSON.stringify(tools, null, 2)
  );

  return {
    clients: {
      time: timeClient,
      calculator: calculatorClient,
      finance: financeClient,
      rag: ragClient,
    },

    tools,
  };
}

// --------------------------------------------------
// Convert MCP tools to Gemini tools
// --------------------------------------------------

function convertToolsToGemini(
  tools: McpToolInfo[]
) {
  // Remove internal server information
  // before sending tools to Gemini.

  const cleanTools = tools.map(
    ({ server, ...tool }) => tool
  );

  return convertMcpToolsToGeminiTools(
    cleanTools
  );
}

// --------------------------------------------------
// Execute tool on correct MCP server
// --------------------------------------------------

async function executeTool(
  clients: Record<McpServerName, Client>,
  toolName: string,
  toolArguments: any
) {

  // Find which server owns this tool
  const server =
    toolServerMap[toolName];

  if (!server) {
    throw new Error(
      `No MCP server found for tool '${toolName}'.`
    );
  }

  console.log(
    `Routing tool '${toolName}' to '${server}' MCP server.`
  );

  const client = clients[server];

  return await client.callTool({
    name: toolName,
    arguments: toolArguments,
  });
}

// --------------------------------------------------
// Export MCP service
// --------------------------------------------------

export default {
  getTools,
  convertToolsToGemini,
  executeTool,
};