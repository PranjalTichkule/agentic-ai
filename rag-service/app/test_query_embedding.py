from app.embedding_service import EmbeddingService


embedding_service = EmbeddingService()


question = "What types of housing loans can banks provide?"


query_embedding = embedding_service.embed_query(
    question
)


print("Vector type:", type(query_embedding))

print(
    "Vector length:",
    len(query_embedding)
)

print(
    "First 5 values:",
    query_embedding[:5]
)