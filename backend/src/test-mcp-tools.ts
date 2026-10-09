import mcpService from "./services/mcpService";


async function testMcpService() {

  try {

    const result = await mcpService.getTools();

    console.log("\n========== ALL MCP TOOLS ==========");

    for (const tool of result.tools) {

      console.log(
        `${tool.name} → ${tool.server}`
      );
    }

    console.log("====================================");


    console.log("\n========== GEMINI TOOLS ==========");

    const geminiTools =
      mcpService.convertToolsToGemini(
        result.tools
      );

    console.log(
      JSON.stringify(
        geminiTools,
        null,
        2
      )
    );

    console.log("=================================");


    console.log("\n========== RAG ROUTING TEST ==========");

    const ragResult =
      await mcpService.executeTool(
        result.clients,
        "search_loan_documents",
        {
          question:
            "What types of housing loans can banks provide?",
        }
      );

    console.log(
      JSON.stringify(
        ragResult,
        null,
        2
      )
    );

    console.log("======================================");


  } catch (error) {

    console.error(
      "MCP SERVICE TEST FAILED:"
    );

    console.error(error);
  }
}


testMcpService();