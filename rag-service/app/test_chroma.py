from app.vector_store import VectorStore


vector_store = VectorStore()

print("ChromaDB connected")

print(
    "Collection count:",
    vector_store.collection.count()
)