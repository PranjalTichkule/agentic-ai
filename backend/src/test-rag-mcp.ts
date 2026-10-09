import { getRagMcpClient } from "./mcp/mcpClient";


async function testRagMcp() {

  try {

    const client = await getRagMcpClient();


    const tools = await client.listTools();

    console.log("\n========== AVAILABLE TOOLS ==========");

    console.log(
      tools.tools.map(tool => tool.name)
    );


    const result = await client.callTool({
      name: "search_loan_documents",

      arguments: {
        question:
          "What types of housing loans can banks provide?",
      },
    });


    console.log("\n========== RAG MCP RESULT ==========");

    console.log(
      JSON.stringify(result, null, 2)
    );

    console.log("====================================");


  } catch (error) {

    console.error(
      "RAG MCP TEST FAILED:"
    );

    console.error(error);
  }
}


testRagMcp();