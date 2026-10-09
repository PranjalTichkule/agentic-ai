from app.pdf_loader import PDFLoader
from app.text_cleaner import TextCleaner
from app.chunker import TextChunker
from app.embedding_service import EmbeddingService


# 1. Load PDF

loader = PDFLoader("../documents/housing_finance.pdf")

pages = loader.load()


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


# 4. Prepare chunk texts

chunk_texts = [
    chunk["text"]
    for chunk in chunks
]


# 5. Generate embeddings

embedding_service = EmbeddingService()

embeddings = embedding_service.embed_batch(chunk_texts)


# 6. Attach embeddings to chunks

for chunk, embedding in zip(chunks, embeddings):

    chunk["embedding"] = embedding


# 7. Verify

print("Total embeddings:", len(embeddings))

print(
    "Embedding dimension:",
    len(embeddings[0])
)


for chunk in chunks[:3]:

    print("\nChunk:", chunk["chunk_id"])
    print(
        "Pages:",
        chunk["page_start"],
        "-",
        chunk["page_end"]
    )

    print(
        "Vector length:",
        len(chunk["embedding"])
    )

    print(
        "First 5 values:",
        chunk["embedding"][:5]
    )