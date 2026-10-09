from app.embedding_service import EmbeddingService
from app.vector_store import VectorStore
from app.retriever import Retriever
from app.generation_service import GenerationService


# 1. User question

question = "What is the process for opening a savings bank account?"


# 2. Create query embedding

embedding_service = EmbeddingService()

query_embedding = embedding_service.embed_query(
    question
)


# 3. Connect to ChromaDB

vector_store = VectorStore()


# 4. Create retriever

retriever = Retriever(
    vector_store
)


# 5. Retrieve relevant chunks

results = retriever.search(
    query_embedding,
    top_k=3
)

print("\nQUESTION:", question)
print("RESULT COUNT:", len(results))

if not results:

    print("\nANSWER:")
    print(
        "I could not find relevant information "
        "in the provided documents."
    )

    exit()


# 6. Build context

context_parts = []

for result in results:

    context_parts.append(
        f"""
Pages {result["metadata"]["page_start"]}-
{result["metadata"]["page_end"]}:

{result["text"]}
"""
    )


context = "\n\n".join(context_parts)


# 7. Generate answer

generation_service = GenerationService()

answer = generation_service.generate(
    question,
    context
)


# 8. Display

print("\nQUESTION:")
print(question)

print("\nANSWER:")
print(answer)

print("\nRETRIEVED SOURCES:")

for result in results:

    print(
        f"- {result['id']} "
        f"(pages "
        f"{result['metadata']['page_start']}-"
        f"{result['metadata']['page_end']}, "
        f"score={result['score']:.4f})"
    )