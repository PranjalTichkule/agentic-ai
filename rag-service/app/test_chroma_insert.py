from app.vector_store import VectorStore


vector_store = VectorStore()


vector_store.add_document(
    document_id="test-1",
    text="Banks may provide housing loans.",
    embedding=[0.1, 0.2, 0.3],
    metadata={
        "page_start": 4,
        "page_end": 5
    }
)


print(
    "Collection count:",
    vector_store.collection.count()
)