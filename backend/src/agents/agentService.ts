// import gemini from "../config/gemini";
// import { getMcpClient } from "../mcp/mcpClient";
// import { convertMcpToolsToGeminiTools } from "../mcp/mcpToolConverter";
import { validateInput } from "../guardrails/inputGuardrail";
import { validateToolCall } from "../guardrails/toolGuardrail";
import { validateOutput } from "../guardrails/outputGuardrail";
// import Message from "../models/Message";
import conversationService from "../services/conversationService";
import geminiService from "../services/geminiService";
import mcpService from "../services/mcpService";
import memoryService from "../services/memoryService";
import {
  extractMemory,
} from "../services/memoryExtractor";

// Agent loop limits
const MAX_GEMINI_CALLS = 4;
const MAX_TOOL_ROUNDS = 3;
const MAX_TOOL_CALLS = 6;

async function processMessage(userId: string, conversationId: string, message: string) {

    // --------------------------------------------------
    // Input Guardrail
    // --------------------------------------------------

    const inputGuardrail = validateInput(message);

    if (!inputGuardrail.allowed) {
        throw new Error(
            `Input blocked: ${inputGuardrail.reason}`
        );
    }

    const extractedMemory =
        extractMemory(message);

    if (extractedMemory) {
        await memoryService.saveMemory(
            userId,
            extractedMemory.key,
            extractedMemory.value
        );

        console.log(
            "Memory saved:",
            extractedMemory
        );
    }

    // --------------------------------------------------
    // Conversation Context
    // --------------------------------------------------

    const previousMessages = await conversationService.getMessages(conversationId);

    console.log("Previous conversation messages:");
    console.log(JSON.stringify(previousMessages, null, 2));

    // Save current user message
    await conversationService.saveUserMessage(
        conversationId,
        message
    );

    const memories =
        await memoryService.getAllMemories(userId);

    console.log("User memories:");
    console.log(
        JSON.stringify(memories, null, 2)
    );

    const memoryContext = memories
        .map(
            (memory) =>
                `${memory.key}: ${memory.value}`
        )
        .join("\n");

    // Build conversation context for Gemini
    const conversationContext =
        previousMessages
            .map(
                (msg) =>
                    `${msg.role}: ${msg.content}`
            )
            .join("\n");

    let currentInput = "";

    if (memoryContext) {
        currentInput +=
            `Persistent user memories:\n` +
            `${memoryContext}\n\n`;
    }

    if (conversationContext) {
        currentInput +=
            `Current conversation:\n` +
            `${conversationContext}\n\n`;
    }

    currentInput += `user: ${message}`;

    // --------------------------------------------------
    // 1. Connect to MCP server
    // --------------------------------------------------

    // --------------------------------------------------
    // MCP connection and tool discovery
    // --------------------------------------------------

    const {
        clients,
        tools: mcpTools,
    } = await mcpService.getTools();

    console.log("MCP client is ready");

    console.log("MCP tools discovered:");
    console.log(
        JSON.stringify(mcpTools, null, 2)
    );

    // --------------------------------------------------
    // Convert MCP tools to Gemini tools
    // --------------------------------------------------

    const geminiTools =
        mcpService.convertToolsToGemini(mcpTools);

    // console.log("Gemini tools:");
    // console.log(
    //     JSON.stringify(geminiTools, null, 2)
    // );

    // --------------------------------------------------
    // 4. Agent loop counters
    // --------------------------------------------------

    let geminiCallCount = 0;
    let toolRound = 0;
    let toolCallCount = 0;

    // --------------------------------------------------
    // 5. Initial Gemini call
    // --------------------------------------------------

    geminiCallCount++;

    console.log(`Gemini call #${geminiCallCount}`);

    let interaction =
        await geminiService.createInteraction({
            input: currentInput,

            tools: geminiTools,

            systemInstruction: `
      You are a helpful AI assistant.

      Use available tools when necessary.
      Never invent tool results.
      Use the tool results to answer the user accurately.
      If a tool returns an error, explain it to the user.
    `,
        });

    // --------------------------------------------------
    // 6. Agent tool-calling loop
    // --------------------------------------------------

    while (true) {

        // Find function calls from Gemini
        const functionCalls: any[] =
            interaction.steps.filter(
                (step: any) =>
                    step.type === "function_call"
            );

        // --------------------------------------------------
        // No tool calls = Gemini has finished
        // --------------------------------------------------

        if (functionCalls.length === 0) {
            console.log(
                "No more tool calls. Agent completed."
            );

            break;
        }

        // --------------------------------------------------
        // Check tool round limit
        // --------------------------------------------------

        if (toolRound >= MAX_TOOL_ROUNDS) {
            console.log(
                "Maximum tool rounds reached."
            );

            break;
        }

        // --------------------------------------------------
        // Check Gemini call limit
        // --------------------------------------------------

        if (geminiCallCount >= MAX_GEMINI_CALLS) {
            console.log(
                "Maximum Gemini calls reached."
            );

            break;
        }

        toolRound++;

        console.log(
            `Starting tool round ${toolRound}`
        );

        const functionResults: any[] = [];

        // --------------------------------------------------
        // 7. Execute all requested tools
        // --------------------------------------------------

        for (const functionCall of functionCalls) {

            // Check total tool-call limit
            if (toolCallCount >= MAX_TOOL_CALLS) {
                console.log(
                    "Maximum MCP tool calls reached."
                );

                break;
            }

            toolCallCount++;

            console.log(
                `Tool call #${toolCallCount}`
            );

            console.log(
                `Tool requested: ${functionCall.name}`
            );

            console.log(
                "Arguments:",
                functionCall.arguments
            );

            // --------------------------------------------------
            // Tool Guardrail
            // --------------------------------------------------

            const toolGuardrail = validateToolCall(
                functionCall.name,
                functionCall.arguments
            );

            if (!toolGuardrail.allowed) {

                console.log(
                    `Tool blocked: ${toolGuardrail.reason}`
                );

                functionResults.push({
                    type: "function_result",

                    name: functionCall.name,

                    call_id: functionCall.id,

                    result: [
                        {
                            type: "text",
                            text: `Tool blocked: ${toolGuardrail.reason}`,
                        },
                    ],
                });

                continue;
            }

            console.log("Tool guardrail passed.");

            try {

                // --------------------------------------------------
                // Execute MCP tool
                // --------------------------------------------------

                const result =
                    await mcpService.executeTool(
                        clients,
                        functionCall.name,
                        functionCall.arguments
                    );

                console.log(
                    "MCP tool result:"
                );

                console.log(
                    JSON.stringify(result, null, 2)
                );

                // --------------------------------------------------
                // Prepare tool result for Gemini
                // --------------------------------------------------

                functionResults.push({
                    type: "function_result",

                    name: functionCall.name,

                    call_id: functionCall.id,

                    result: [
                        {
                            type: "text",
                            text: JSON.stringify(result),
                        },
                    ],
                });

            } catch (error) {

                console.error(
                    `Error executing tool ${functionCall.name}:`,
                    error
                );

                // --------------------------------------------------
                // Send tool error back to Gemini
                // --------------------------------------------------

                functionResults.push({
                    type: "function_result",

                    name: functionCall.name,

                    call_id: functionCall.id,

                    result: [
                        {
                            type: "text",

                            text:
                                `Tool execution failed: ${error instanceof Error
                                    ? error.message
                                    : String(error)
                                }`,
                        },
                    ],
                });
            }
        }

        // --------------------------------------------------
        // Check if we actually have tool results
        // --------------------------------------------------

        if (functionResults.length === 0) {
            console.log(
                "No tool results generated. Stopping agent."
            );

            break;
        }

        // --------------------------------------------------
        // 8. Send tool results back to Gemini
        // --------------------------------------------------

        if (geminiCallCount >= MAX_GEMINI_CALLS) {
            console.log(
                "Maximum Gemini calls reached before sending tool results."
            );

            break;
        }

        geminiCallCount++;

        console.log(
            `Gemini call #${geminiCallCount}`
        );

        console.log(
            `Sending tool results to Gemini. Round: ${toolRound}`
        );

        interaction =
            await geminiService.createInteraction({
                previousInteractionId: interaction.id,

                input: functionResults,

                tools: geminiTools,
            });
    }

    // --------------------------------------------------
    // 9. Agent statistics
    // --------------------------------------------------

    console.log("Agent completed.");

    console.log("Agent statistics:", {
        geminiCallCount,
        toolRound,
        toolCallCount,
    });

    // --------------------------------------------------
    // 10. Return final Gemini interaction
    // --------------------------------------------------


    // --------------------------------------------------
    // Output Guardrail
    // --------------------------------------------------

    const outputText = interaction.output_text || "";

    const outputGuardrail = validateOutput(outputText);

    if (!outputGuardrail.allowed) {
        console.log(
            `Output blocked: ${outputGuardrail.reason}`
        );

        throw new Error(
            `Output blocked: ${outputGuardrail.reason}`
        );
    }

    console.log("Output guardrail passed.");

    // --------------------------------------------------
    // Save assistant response
    // --------------------------------------------------

    await conversationService.saveAssistantMessage(
        conversationId,
        outputText
    );

    console.log("Assistant response saved to conversation.");

    return interaction?.output_text;
}

// Preserve default export expected by agentRoutes.ts
export default {
    processMessage,
};