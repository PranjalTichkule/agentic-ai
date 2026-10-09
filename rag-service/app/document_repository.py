import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, TypedDict


DocumentStatus = Literal["UPLOADING", "PROCESSING", "READY", "FAILED"]


class DocumentMetadata(TypedDict):
    document_id: str
    filename: str
    file_path: str
    page_count: int
    chunk_count: int
    status: DocumentStatus
    created_at: str
    updated_at: str


class DocumentRepository:
    def __init__(self, file_path: str | Path | None = None):
        service_root = Path(__file__).resolve().parent.parent
        self.file_path = (
            Path(file_path)
            if file_path is not None
            else service_root / "data" / "documents.json"
        )
        self.file_path.parent.mkdir(parents=True, exist_ok=True)

        if not self.file_path.exists():
            self.file_path.write_text("[]\n", encoding="utf-8")

    def create_document(
        self,
        document_id: str,
        filename: str,
        file_path: str,
        page_count: int = 0,
        chunk_count: int = 0,
        status: DocumentStatus = "UPLOADING"
    ) -> DocumentMetadata:
        documents = self._read_documents()

        if any(document["document_id"] == document_id for document in documents):
            raise ValueError(f"Document already exists: {document_id}")

        self._validate_status(status)
        self._validate_counts(page_count, chunk_count)

        now = self._now()
        document: DocumentMetadata = {
            "document_id": document_id,
            "filename": filename,
            "file_path": file_path,
            "page_count": page_count,
            "chunk_count": chunk_count,
            "status": status,
            "created_at": now,
            "updated_at": now
        }

        documents.append(document)
        self._write_documents(documents)
        return document

    def get_document(self, document_id: str) -> DocumentMetadata | None:
        for document in self._read_documents():
            if document["document_id"] == document_id:
                return document

        return None

    def list_documents(self) -> list[DocumentMetadata]:
        return self._read_documents()

    def update_document(
        self,
        document_id: str,
        *,
        filename: str | None = None,
        file_path: str | None = None,
        page_count: int | None = None,
        chunk_count: int | None = None,
        status: DocumentStatus | None = None
    ) -> DocumentMetadata | None:
        documents = self._read_documents()

        for document in documents:
            if document["document_id"] != document_id:
                continue

            if status is not None:
                self._validate_status(status)
                document["status"] = status
            if page_count is not None:
                self._validate_counts(page_count, document["chunk_count"])
                document["page_count"] = page_count
            if chunk_count is not None:
                self._validate_counts(document["page_count"], chunk_count)
                document["chunk_count"] = chunk_count
            if filename is not None:
                document["filename"] = filename
            if file_path is not None:
                document["file_path"] = file_path

            document["updated_at"] = self._now()
            self._write_documents(documents)
            return document

        return None

    def delete_document(self, document_id: str) -> bool:
        documents = self._read_documents()
        remaining_documents = [
            document
            for document in documents
            if document["document_id"] != document_id
        ]

        if len(remaining_documents) == len(documents):
            return False

        self._write_documents(remaining_documents)
        return True

    def restore_document(self, document: DocumentMetadata) -> None:
        documents = self._read_documents()

        for index, current_document in enumerate(documents):
            if current_document["document_id"] == document["document_id"]:
                documents[index] = document
                self._write_documents(documents)
                return

        documents.append(document)
        self._write_documents(documents)

    def _read_documents(self) -> list[DocumentMetadata]:
        try:
            with self.file_path.open("r", encoding="utf-8") as metadata_file:
                documents = json.load(metadata_file)
        except json.JSONDecodeError as error:
            raise ValueError(
                f"Invalid document metadata JSON in {self.file_path}"
            ) from error

        if not isinstance(documents, list):
            raise ValueError("Document metadata file must contain a JSON list")

        return documents

    def _write_documents(self, documents: list[DocumentMetadata]) -> None:
        temporary_path = self.file_path.with_name(self.file_path.name + ".tmp")

        with temporary_path.open("w", encoding="utf-8") as metadata_file:
            json.dump(documents, metadata_file, indent=2)
            metadata_file.write("\n")

        temporary_path.replace(self.file_path)

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _validate_status(status: str) -> None:
        valid_statuses = {"UPLOADING", "PROCESSING", "READY", "FAILED"}
        if status not in valid_statuses:
            raise ValueError(f"Invalid document status: {status}")

    @staticmethod
    def _validate_counts(page_count: int, chunk_count: int) -> None:
        if page_count < 0 or chunk_count < 0:
            raise ValueError("Page and chunk counts cannot be negative")