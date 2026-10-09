import shutil
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.document_repository import DocumentRepository, DocumentStatus
from app.document_service import (
    DocumentDeletionError,
    DocumentNotFoundError,
    delete_document as delete_document_service,
    process_document
)
from app.rag_service import RAGService
from app.vector_store import VectorStore


app = FastAPI(
    title="RAG Service",
    description="Python RAG service for the Agentic AI application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4201"
    ],
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
    allow_credentials=False
)


class RAGRequest(BaseModel):

    question: str


class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    page_count: int
    chunk_count: int
    status: DocumentStatus
    created_at: str
    updated_at: str


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]


rag_service = RAGService()
document_repository = DocumentRepository()
DOCUMENTS_DIR = Path(__file__).resolve().parent.parent / "documents"


@app.get("/")
def root():

    return {
        "message": "RAG service is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


@app.get("/documents", response_model=DocumentListResponse)
def list_documents():
    return {
        "documents": document_repository.list_documents()
    }


@app.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str):
    document = document_repository.get_document(document_id)

    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    return document


@app.delete("/documents/{document_id}")
def delete_document_endpoint(document_id: str):
    try:
        delete_document_service(document_id)
    except DocumentNotFoundError as error:
        raise HTTPException(status_code=404, detail="Document not found") from error
    except DocumentDeletionError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    return {
        "message": "Document deleted",
        "document_id": document_id
    }


@app.post("/rag/query")
def rag_query(request: RAGRequest):

    return rag_service.query(
        request.question
    )


@app.post("/documents")
def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A PDF filename is required")

    filename = Path(file.filename.replace("\\", "/")).name.strip()

    if not filename or Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_header = file.file.read(1024)
    file.file.seek(0)

    if b"%PDF-" not in file_header:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF")

    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    file_path = DOCUMENTS_DIR / filename

    with file_path.open("wb") as saved_file:
        shutil.copyfileobj(file.file, saved_file)

    file_path_string = str(file_path.resolve())
    document_id = VectorStore.create_document_id(file_path_string)

    existing_document = document_repository.get_document(document_id)
    if existing_document:
        document_repository.update_document(
            document_id,
            filename=filename,
            file_path=file_path_string,
            page_count=0,
            chunk_count=0,
            status="PROCESSING"
        )
    else:
        document_repository.create_document(
            document_id=document_id,
            filename=filename,
            file_path=file_path_string,
            status="PROCESSING"
        )

    try:
        result = process_document(
            file_path=file_path_string,
            document_id=document_id,
            filename=filename
        )
    except Exception as error:
        failed_document = document_repository.update_document(
            document_id,
            status="FAILED"
        )
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Document processing failed",
                "document": failed_document
            }
        ) from error

    ready_document = document_repository.update_document(
        document_id,
        page_count=result["page_count"],
        chunk_count=result["chunk_count"],
        status="READY"
    )

    if ready_document is None:
        raise HTTPException(
            status_code=500,
            detail="Document processed but its metadata could not be updated"
        )

    return ready_document