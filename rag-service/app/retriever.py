from app.similarity import cosine_similarity


class Retriever:

    def __init__(self, vector_store):

        self.vector_store = vector_store

    def search(
        self,
        query_embedding,
        top_k=3,
        min_score=0.60
    ):

        data = self.vector_store.get_all_documents()

        results = []

        for index in range(len(data["ids"])):

            document_embedding = data["embeddings"][index]

            score = cosine_similarity(
                query_embedding,
                document_embedding
            )

            print(f"{data['ids'][index]} -> {score}")

            if score >= min_score:
                metadata = data["metadatas"][index]

                results.append({
                    "id": data["ids"][index],
                    "text": data["documents"][index],
                    "document_id": metadata.get("document_id"),
                    "filename": metadata.get("filename"),
                    "page_start": metadata.get("page_start"),
                    "page_end": metadata.get("page_end"),
                    "metadata": metadata,
                    "score": score
                })

        results.sort(
            key=lambda result: result["score"],
            reverse=True
        )

        return results[:top_k]