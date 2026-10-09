import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


class EmbeddingService:

    def __init__(self):

        load_dotenv()

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = "gemini-embedding-001"

    def embed(self, text):

        response = self.client.models.embed_content(
            model=self.model,
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT"
            )
        )

        return response.embeddings[0].values

    def embed_batch(self, texts):

        response = self.client.models.embed_content(
            model=self.model,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT"
            )
        )

        return [
            embedding.values
            for embedding in response.embeddings
        ]

    def embed_query(self, text):

        response = self.client.models.embed_content(
            model=self.model,
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY"
            )
        )

        return response.embeddings[0].values