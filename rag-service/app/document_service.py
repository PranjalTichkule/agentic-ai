import os
import tempfile
from pathlib import Path

from app.chunker import TextChunker
from app.document_repository import DocumentMetadata, DocumentRepository
from app.embedding_service import EmbeddingService
from app.pdf_loader import PDFLoader
from app.text_cleaner import TextCleaner
from app.vector_store import VectorStore


class DocumentNotFoundError(Exception):
    pass


class DocumentDeletionError(RuntimeError):
    pass


def process_document(
    file_path: str,
    document_id: str,
    filename: str
) -> dict[str, str | int]:
    try:
        if not document_id.strip():
            raise ValueError("document_id cannot be empty")

        pages = PDFLoader(file_path).load()

        if not pages:
            raise ValueError("The PDF contains no pages")

        cleaner = TextCleaner()
        cleaned_pages = [
            {
                "page": page["page"],
                "text": cleaner.clean(page["text"])
            }
            for page in pages
        ]

        chunks = TextChunker().chunk(cleaned_pages)

        if not chunks:
            raise ValueError("No text chunks could be created from the PDF")

        chunk_texts = [chunk["text"] for chunk in chunks]
        embeddings = EmbeddingService().embed_batch(chunk_texts)

        VectorStore().add_chunks(
            document_id=document_id,
            filename=filename,
            chunks=chunks,
            embeddings=embeddings
        )

        return {
            "document_id": document_id,
            "filename": filename,
            "page_count": len(pages),
            "chunk_count": len(chunks),
            "status": "READY"
        }
    except Exception as error:
        raise RuntimeError(
            f"Failed to process PDF '{filename}': {error}"
        ) from error


def delete_document(document_id: str) -> None:
    repository = DocumentRepository()
    document = repository.get_document(document_id)

    if document is None:
        raise DocumentNotFoundError(document_id)

    service_root = Path(__file__).resolve().parent.parent
    documents_directory = (service_root / "documents").resolve()
    file_path = Path(document["file_path"]).resolve()

    if not file_path.is_relative_to(documents_directory):
        raise DocumentDeletionError(
            "The stored PDF path is outside the documents directory"
        )

    vector_store = VectorStore()

    try:
        vector_snapshot = vector_store.get_document_snapshot(document_id)
    except Exception as error:
        raise DocumentDeletionError(
            "Could not verify the document vectors; nothing was deleted"
        ) from error

    backup_path = None
    metadata_deleted = False

    try:
        if file_path.exists():
            file_descriptor, backup_name = tempfile.mkstemp(
                prefix=f".{file_path.name}.",
                suffix=".deleting",
                dir=documents_directory
            )
            os.close(file_descriptor)
            backup_path = Path(backup_name)
            backup_path.unlink()
            file_path.replace(backup_path)

        vector_store.delete_document(document_id)

        metadata_deleted = repository.delete_document(document_id)
        if not metadata_deleted:
            raise RuntimeError("Document metadata was not deleted")

        if backup_path is not None:
            backup_path.unlink()
    except Exception as error:
        rollback_errors = []

        if metadata_deleted:
            try:
                repository.restore_document(document)
            except Exception as rollback_error:
                rollback_errors.append(rollback_error)

        try:
            vector_store.restore_document_snapshot(vector_snapshot)
        except Exception as rollback_error:
            rollback_errors.append(rollback_error)

        if backup_path is not None and backup_path.exists():
            try:
                backup_path.replace(file_path)
            except Exception as rollback_error:
                rollback_errors.append(rollback_error)

        if rollback_errors:
            raise DocumentDeletionError(
                "Document deletion failed and rollback was incomplete"
            ) from error

        raise DocumentDeletionError(
            "Document deletion failed; the document was restored"
        ) from error