
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

async function main() {
  // Create the MCP client
  const client = new Client({
    name: "time-mcp-test-client",
    version: "1.0.0",
  });

  // Launch the MCP server as a child process
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "./node_modules/tsx/dist/cli.mjs",
      "src/mcp/timeMcpServer.ts",
    ],
    cwd: process.cwd(),
    stderr: "inherit",
  });

  try {
    // Connect and perform the MCP initialization handshake
    await client.connect(transport);

    console.log("Connected to MCP server!");

    // Discover the tools exposed by the server
    const { tools } = await client.listTools();

    console.log("\nAvailable MCP tools:");

    for (const tool of tools) {
      console.log(`- ${tool.name}: ${tool.description}`);
    }

    // Call the discovered tool
    const result = await client.callTool({
      name: "get_current_time",
      arguments: {
        timezone: "Asia/Kolkata",
      },
    });

    console.log("\nTool result:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("MCP client failed:", error);
  process.exitCode = 1;
});