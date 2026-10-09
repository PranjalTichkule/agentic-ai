from app.vector_store import VectorStore


vector_store = VectorStore()

print("Before reset:", vector_store.count())

vector_store.reset_collection()

print("After reset:", vector_store.count())

print("Collection reset successfully")