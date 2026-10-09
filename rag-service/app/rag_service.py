from app.embedding_service import EmbeddingService
from app.vector_store import VectorStore
from app.retriever import Retriever
from app.generation_service import GenerationService


class RAGService:

    def __init__(self):

        self.embedding_service = EmbeddingService()

        self.vector_store = VectorStore()

        self.retriever = Retriever(
            self.vector_store
        )

        self.generation_service = GenerationService()

    def query(
        self,
        question,
        top_k=3,
        min_score=0.60
    ):

        # 1. Convert question into embedding
        query_embedding = self.embedding_service.embed_query(
            question
        )

        # 2. Retrieve relevant chunks
        results = self.retriever.search(
            query_embedding,
            top_k=top_k,
            min_score=min_score
        )

        # 3. No relevant information
        if not results:

            return {
                "answer": (
                    "I could not find relevant information "
                    "in the provided documents."
                ),
                "sources": []
            }

        # 4. Build context
        context = "\n\n".join(
            result["text"]
            for result in results
        )

        # 5. Generate answer
        answer = self.generation_service.generate(
            question,
            context
        )

        # 6. Build source information
        sources = []

        for result in results:

            sources.append({
                "chunk_id": result["id"],
                "document_id": result["document_id"],
                "filename": result["filename"],
                "page_start": result["page_start"],
                "page_end": result["page_end"],
                "score": result["score"]
            })

        return {
            "answer": answer,
            "sources": sources
        }