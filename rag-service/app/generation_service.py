import os

from dotenv import load_dotenv
from google import genai


class GenerationService:

    def __init__(self):

        load_dotenv()

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured"
            )

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = os.getenv(
            "GEMINI_MODEL",
            "gemini-2.5-flash"
        )

        print("Generation model:", self.model)

    def generate(self, question, context):

        prompt = f"""
You are a helpful assistant answering questions
about housing finance regulations.

Answer the user's question using only the
provided context.

If the answer cannot be found in the context,
say that the information is not available
in the provided documents.

Do not make up information.

Context:
{context}

User question:
{question}

Answer:
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt
        )

        return response.text