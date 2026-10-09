import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const server = new McpServer({
  name: "calculator-mcp-server",
  version: "1.0.0",
});

// --------------------------------------------------
// Add two numbers
// --------------------------------------------------

server.registerTool(
  "add_numbers",
  {
    description:
      "Add two numbers together.",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
  },
  async ({ a, b }) => {
    const result = a + b;

    return {
      content: [
        {
          type: "text",
          text: String(result),
        },
      ],
    };
  }
);

// --------------------------------------------------
// Multiply two numbers
// --------------------------------------------------

server.registerTool(
  "multiply_numbers",
  {
    description:
      "Multiply two numbers together.",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
  },
  async ({ a, b }) => {
    const result = a * b;

    return {
      content: [
        {
          type: "text",
          text: String(result),
        },
      ],
    };
  }
);

// --------------------------------------------------
// Start MCP server
// --------------------------------------------------

async function main() {
  await serveStdio(() => server);
}

main().catch((error) => {
  console.error(
    "Calculator MCP server failed:",
    error
  );

  process.exit(1);
});