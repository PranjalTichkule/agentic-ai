interface ExtractedMemory {
  key: string;
  value: string;
}

const MEMORY_KEY_ALIASES: Record<string, string> = {
  "preferred currency": "preferred_currency",
  "my preferred currency": "preferred_currency",

  "preferred city": "preferred_city",
  "my preferred city": "preferred_city",

  "preferred language": "preferred_language",
  "my preferred language": "preferred_language",

  "name": "name",
  "my name": "name",

  "location": "location",
  "my location": "location",
};

function normalizeKey(rawKey: string): string {
  const cleanedKey = rawKey
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (MEMORY_KEY_ALIASES[cleanedKey]) {
    return MEMORY_KEY_ALIASES[cleanedKey];
  }

  return cleanedKey
    .replace(/^my\s+/, "")
    .replace(/\s+/g, "_");
}

export function extractMemory(
  message: string
): ExtractedMemory | null {
  const normalizedMessage = message.trim();

  const match = normalizedMessage.match(
    /^remember\s+that\s+(.+?)\s+is\s+(.+)$/i
  );

  if (!match) {
    return null;
  }

  const key = normalizeKey(match[1]);
  const value = match[2].trim();

  if (!key || !value) {
    return null;
  }

  return {
    key,
    value,
  };
}