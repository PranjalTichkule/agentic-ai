import { queryRAG } from "./services/ragService";

async function testRAG() {

  try {

    const result = await queryRAG(
      "What types of housing loans can banks provide?"
    );

    console.log("\n========== RAG TEST ==========");

    console.log("ANSWER:");
    console.log(result.answer);

    console.log("\nSOURCES:");
    console.log(result.sources);

    console.log("==============================");

  } catch (error) {

    console.error("RAG TEST FAILED:");
    console.error(error);
  }
}

testRAG();