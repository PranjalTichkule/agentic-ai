import hashlib
from pathlib import Path

import chromadb

from app.similarity import cosine_similarity


class VectorStore:

    COLLECTION_NAME = "loan_knowledge"

    def __init__(self):

        # Project root:
        # rag-service/
        BASE_DIR = Path(__file__).resolve().parent.parent

        # Persistent ChromaDB location:
        # rag-service/chroma_db/
        CHROMA_PATH = BASE_DIR / "chroma_db"

        print("ChromaDB path:", CHROMA_PATH)

        self.client = chromadb.PersistentClient(
            path=str(CHROMA_PATH)
        )

        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME
        )

    @staticmethod
    def create_document_id(filename):
        base_dir = Path(__file__).resolve().parent.parent
        document_path = Path(filename).expanduser()

        if not document_path.is_absolute():
            document_path = base_dir / document_path

        normalized_path = document_path.resolve().as_posix().casefold()

        return hashlib.sha256(
            normalized_path.encode("utf-8")
        ).hexdigest()

    def add_chunks(self, document_id, filename, chunks, embeddings):
        if not document_id:
            raise ValueError("document_id cannot be empty")

        if len(chunks) != len(embeddings):
            raise ValueError("Each chunk must have one embedding")

        if not chunks:
            return

        document_key = hashlib.sha256(
            document_id.encode("utf-8")
        ).hexdigest()

        self.delete_document(document_id)

        self.collection.upsert(
            ids=[
                f"{document_key}-chunk-{index}"
                for index in range(len(chunks))
            ],
            documents=[
                chunk["text"]
                for chunk in chunks
            ],
            embeddings=embeddings,
            metadatas=[
                {
                    "document_id": document_id,
                    "filename": filename,
                    "page_start": chunk["page_start"],
                    "page_end": chunk["page_end"]
                }
                for chunk in chunks
            ]
        )

    def delete_document(self, document_id):

        self.collection.delete(
            where={"document_id": document_id}
        )

    def get_document_snapshot(self, document_id):
        return self.collection.get(
            where={"document_id": document_id},
            include=["documents", "embeddings", "metadatas"]
        )

    def restore_document_snapshot(self, snapshot):
        if not snapshot["ids"]:
            return

        self.collection.upsert(
            ids=snapshot["ids"],
            documents=snapshot["documents"],
            embeddings=snapshot["embeddings"],
            metadatas=snapshot["metadatas"]
        )

    def list_documents(self):
        data = self.collection.get(
            include=["metadatas"]
        )

        documents = {}

        for metadata in data["metadatas"] or []:
            document_id = metadata["document_id"]

            if document_id not in documents:
                documents[document_id] = {
                    "document_id": document_id,
                    "filename": metadata["filename"],
                    "chunk_count": 0
                }

            documents[document_id]["chunk_count"] += 1

        return sorted(
            documents.values(),
            key=lambda document: document["filename"].casefold()
        )

    def get_document(self, document_id):
        data = self.collection.get(
            where={"document_id": document_id},
            include=["documents", "metadatas"]
        )

        if not data["ids"]:
            return None

        metadata = data["metadatas"][0]

        return {
            "document_id": document_id,
            "filename": metadata["filename"],
            "chunks": [
                {
                    "id": chunk_id,
                    "text": text,
                    "metadata": chunk_metadata
                }
                for chunk_id, text, chunk_metadata in zip(
                    data["ids"],
                    data["documents"],
                    data["metadatas"]
                )
            ]
        }

    def retrieve(self, query_embedding, top_k):
        data = self.get_all_documents()
        results = []

        for index in range(len(data["ids"])):
            metadata = data["metadatas"][index]
            score = cosine_similarity(
                query_embedding,
                data["embeddings"][index]
            )

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

    def reset_collection(self):

        self.client.delete_collection(
            name=self.COLLECTION_NAME
        )

        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME
        )

    def count(self):

        return self.collection.count()

    def get_all_documents(self):

        return self.collection.get(
            include=[
                "documents",
                "embeddings",
                "metadatas"
            ]
        )