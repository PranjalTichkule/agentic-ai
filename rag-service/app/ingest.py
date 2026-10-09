from pathlib import Path

from app.pdf_loader import PDFLoader
from app.text_cleaner import TextCleaner
from app.chunker import TextChunker
from app.embedding_service import EmbeddingService
from app.vector_store import VectorStore


# 1. Load PDF

loader = PDFLoader("../documents/housing_finance.pdf")

pages = loader.load()

print("Total pages:", len(pages))


# 2. Clean text

cleaner = TextCleaner()

cleaned_pages = []

for page in pages:

    cleaned_text = cleaner.clean(page["text"])

    cleaned_pages.append({
        "page": page["page"],
        "text": cleaned_text
    })


# 3. Create chunks

chunker = TextChunker(
    chunk_size=500,
    overlap=50
)

chunks = chunker.chunk(cleaned_pages)

print("Total chunks:", len(chunks))


# 4. Generate embeddings

embedding_service = EmbeddingService()

chunk_texts = [
    chunk["text"]
    for chunk in chunks
]

embeddings = embedding_service.embed_batch(
    chunk_texts
)

print("Total embeddings:", len(embeddings))


# 5. Attach embeddings to chunks

for chunk, embedding in zip(chunks, embeddings):

    chunk["embedding"] = embedding


# 6. Store in ChromaDB

vector_store = VectorStore()

vector_store.add_chunks(
    document_id=vector_store.create_document_id(loader.file_path),
    filename=Path(loader.file_path).name,
    chunks=chunks,
    embeddings=embeddings
)


print(
    "Documents stored:",
    vector_store.count()
)