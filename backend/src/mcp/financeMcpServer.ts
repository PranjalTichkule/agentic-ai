import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const server = new McpServer({
  name: "finance-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "convert_currency",
  {
    description:
      "Convert an amount from one currency to another using the latest exchange rate.",
    inputSchema: {
      from: z
        .string()
        .describe("Source currency code, for example USD"),

      to: z
        .string()
        .describe("Target currency code, for example INR"),

      amount: z
        .number()
        .positive()
        .describe("Amount to convert"),
    },
  },
  async ({ from, to, amount }) => {
    try {
      const sourceCurrency = from.toUpperCase();
      const targetCurrency = to.toUpperCase();

      const url =
        `https://api.frankfurter.app/latest` +
        `?base=${sourceCurrency}` +
        `&symbols=${targetCurrency}`;

      const response = await fetch(url);
        console.log("Currency conversion response:", response);
      if (!response.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Failed to fetch exchange rate for ` +
                `${sourceCurrency} to ${targetCurrency}.`,
            },
          ],
        };
      }

      const data = await response.json();

      const rate = data.rates?.[targetCurrency];

      if (!rate) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Exchange rate not available for ` +
                `${sourceCurrency} to ${targetCurrency}.`,
            },
          ],
        };
      }

      const convertedAmount = amount * rate;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              from: sourceCurrency,
              to: targetCurrency,
              amount,
              rate,
              convertedAmount,
            }),
          },
        ],
      };
    } catch (error) {
      console.error(
        "Currency conversion error:",
        error
      );

      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              "Unable to retrieve the current exchange rate.",
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
    "Finance MCP server failed:",
    error
  );

  process.exit(1);
});