import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";


const server = new McpServer({
  name: "rag-mcp-server",
  version: "1.0.0",
});


const RAG_SERVICE_URL =
  process.env.RAG_SERVICE_URL ||
  "http://localhost:8000";


server.registerTool(
  "search_loan_documents",

  {
    description:
      "Search the loan knowledge base for information " +
      "about loan types, loan policies, housing finance, " +
      "and other information contained in the provided documents.",

    inputSchema: {
      question: z
        .string()
        .min(1)
        .describe(
          "Question to search in the loan knowledge base"
        ),
    },
  },

  async ({ question }) => {

    try {

      const response = await fetch(
        `${RAG_SERVICE_URL}/rag/query`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question,
          }),
        }
      );


      if (!response.ok) {

        return {
          isError: true,

          content: [
            {
              type: "text",

              text:
                `RAG service returned HTTP ` +
                `${response.status}.`,
            },
          ],
        };
      }


      const data = await response.json();


      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data),
          },
        ],
      };

    } catch (error) {

      console.error(
        "RAG MCP error:",
        error
      );


      return {
        isError: true,

        content: [
          {
            type: "text",

            text:
              "Unable to connect to the RAG service.",
          },
        ],
      };
    }
  }
);


async function main() {

  await serveStdio(() => server);
}


main().catch((error) => {

  console.error(
    "RAG MCP server failed:",
    error
  );

  process.exit(1);
});