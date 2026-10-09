from app.vector_store import VectorStore


vector_store = VectorStore()

print("Before:", vector_store.count())

vector_store.delete_document("test-1")

print("After:", vector_store.count())