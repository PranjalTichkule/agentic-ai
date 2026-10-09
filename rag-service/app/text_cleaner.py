import re


class TextCleaner:

    def clean(self, text):
        text = text.strip()

        # Normalize spaces and tabs
        text = re.sub(r"[ \t]+", " ", text)

        # Remove lines made mostly of underscores
        text = re.sub(r"^\s*_+\s*$", "", text, flags=re.MULTILINE)

        # Remove excessive blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()