import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

let timeClient: Client | null = null;
let calculatorClient: Client | null = null;
let financeClient: Client | null = null;
let ragClient: Client | null = null;

// --------------------------------------------------
// Time / Weather MCP Client
// --------------------------------------------------

export async function getTimeMcpClient(): Promise<Client> {
  if (timeClient) {
    return timeClient;
  }

  timeClient = new Client({
    name: "agentic-ai-time-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "./node_modules/tsx/dist/cli.mjs",
      "src/mcp/timeMcpServer.ts",
    ],
    cwd: process.cwd(),
    stderr: "inherit",
  });

  await timeClient.connect(transport);

  console.log(
    "Connected to Time/Weather MCP server"
  );

  return timeClient;
}

// --------------------------------------------------
// Calculator MCP Client
// --------------------------------------------------

export async function getCalculatorMcpClient(): Promise<Client> {
  if (calculatorClient) {
    return calculatorClient;
  }

  calculatorClient = new Client({
    name: "agentic-ai-calculator-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "./node_modules/tsx/dist/cli.mjs",
      "src/mcp/calculatorMcpServer.ts",
    ],
    cwd: process.cwd(),
    stderr: "inherit",
  });

  await calculatorClient.connect(transport);

  console.log(
    "Connected to Calculator MCP server"
  );

  return calculatorClient;
}

export async function getFinanceMcpClient(): Promise<Client> {
  if (financeClient) {
    return financeClient;
  }

  financeClient = new Client({
    name: "agentic-ai-finance-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "./node_modules/tsx/dist/cli.mjs",
      "src/mcp/financeMcpServer.ts",
    ],
    cwd: process.cwd(),
    stderr: "inherit",
  });

  await financeClient.connect(transport);

  console.log(
    "Connected to Finance MCP server"
  );

  return financeClient;
}

// --------------------------------------------------
// RAG MCP Client
// --------------------------------------------------

export async function getRagMcpClient(): Promise<Client> {
  if (ragClient) {
    return ragClient;
  }

  ragClient = new Client({
    name: "agentic-ai-rag-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "./node_modules/tsx/dist/cli.mjs",
      "src/mcp/ragMcpServer.ts",
    ],
    cwd: process.cwd(),
    stderr: "inherit",
  });

  await ragClient.connect(transport);

  console.log(
    "Connected to RAG MCP server"
  );

  return ragClient;
}