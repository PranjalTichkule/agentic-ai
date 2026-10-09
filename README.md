# Agentic AI and Basic RAG

This repository contains two ways to use retrieval-augmented generation:

- **Basic RAG**: a Python API that ingests PDFs, stores chunks in ChromaDB, retrieves relevant passages, and answers questions with Gemini.
- **Agentic AI**: an Angular chat app and Node.js backend. The backend connects to MongoDB and uses tools, including the RAG API.

## Prerequisites

- Node.js LTS and npm
- Python 3.13 and pip
- MongoDB running locally or an Atlas connection string (Agentic AI only)
- A Google Gemini API key (both projects)

Do not commit real API keys or database credentials. The `.env` files below are local files and are ignored by Git.

## Basic RAG

From the repository root, create and activate a Python environment, then install the RAG dependencies:

```powershell
cd rag-service
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create `rag-service/.env` with your Gemini key. The model setting is optional:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Start the API from the `rag-service` directory:

```powershell
python -m uvicorn app.api:app --reload --port 8000
```

Open `http://localhost:8000/docs`. Use `POST /documents` to upload a PDF, then `POST /rag/query` with a question. `GET /health` checks that the API is running. Uploaded PDFs, metadata, and the local ChromaDB are stored locally and are not part of the Git repository.

## Agentic AI

Run the services in separate terminals. Start the RAG API first using the steps above and leave it running; the agent's RAG tool calls it at `http://localhost:8000` by default.

### 1. Start the Node.js backend

```powershell
cd backend
npm install
```

Create `backend/.env`:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/agentic_ai
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
RAG_SERVICE_URL=http://localhost:8000
```

Replace `MONGO_URI` with your MongoDB Atlas connection string if you are not using a local MongoDB instance. Start the backend:

```powershell
npm run dev
```

Check `http://localhost:3000/health` for a healthy response.

### 2. Start the Angular frontend

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:4200`. If that port is occupied, Angular will report the alternate local URL. The frontend is configured to call the backend on port 3000 and the RAG API on port 8000.

### 3. Try the document assistant

In the app, open **Documents** and upload a PDF. Once it is processed, return to **Chat** and ask a question about the document. The backend starts its MCP tool servers automatically; keep the RAG API, backend, and frontend running while using the app.

## Project Layout

| Path | Purpose |
| --- | --- |
| `rag-service/` | Python RAG API, PDF processing, embeddings, and ChromaDB storage |
| `backend/` | Node.js API, conversations, Gemini integration, and MCP tools |
| `frontend/` | Angular chat, memories, documents, and Redis pages |

Local `.env` files, Python environments, `node_modules`, build output, uploaded PDFs, and ChromaDB files are intentionally excluded from Git. After cloning, create the local `.env` files and upload any PDFs again.