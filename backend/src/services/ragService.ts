const RAG_SERVICE_URL =
  process.env.RAG_SERVICE_URL || "http://localhost:8000";


export interface RAGSource {
  chunk_id: string;
  page_start: number;
  page_end: number;
  score: number;
}


export interface RAGResponse {
  answer: string;
  sources: RAGSource[];
}


export async function queryRAG(
  question: string
): Promise<RAGResponse> {

  const response = await fetch(
    `${RAG_SERVICE_URL}/rag/query`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        question
      })
    }
  );


  if (!response.ok) {

    throw new Error(
      `RAG service returned HTTP ${response.status}`
    );
  }


  const data =
    await response.json() as RAGResponse;


  return data;
}