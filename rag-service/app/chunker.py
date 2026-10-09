import re


class TextChunker:

    def __init__(self, chunk_size=500, overlap=50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def find_body_start(self, pages):

        for index, page in enumerate(pages):

            lines = page["text"].splitlines()

            for line in lines:

                if line.strip() == "1. INTRODUCTION":
                    return index

        return 0

    def chunk(self, pages):

        body_start = self.find_body_start(pages)

        pages = pages[body_start:]

        words = []

        for page in pages:

            page_words = page["text"].split()

            for word in page_words:

                words.append({
                    "word": word,
                    "page": page["page"]
                })

        chunks = []

        start = 0
        chunk_id = 0

        while start < len(words):

            end = start + self.chunk_size

            chunk_words = words[start:end]

            text = " ".join(
                item["word"]
                for item in chunk_words
            )

            pages_in_chunk = sorted(
                set(
                    item["page"]
                    for item in chunk_words
                )
            )

            chunks.append({
                "chunk_id": chunk_id,
                "text": text,
                "page_start": pages_in_chunk[0],
                "page_end": pages_in_chunk[-1]
            })

            chunk_id += 1

            start = end - self.overlap

        return chunks