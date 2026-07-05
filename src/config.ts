import "dotenv/config";

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const apiKey = process.env.ANTHROPIC_API_KEY?.trim() || undefined;
const authToken = process.env.ANTHROPIC_AUTH_TOKEN?.trim() || undefined;

if (!apiKey && !authToken) {
  throw new Error(
    "Thiếu thông tin xác thực. Hãy đặt ANTHROPIC_AUTH_TOKEN hoặc ANTHROPIC_API_KEY trong file .env.",
  );
}

function parseHeaders(value: string | undefined): Record<string, string> {
  if (!value?.trim()) return {};

  return Object.fromEntries(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");
        if (separator < 1) {
          throw new Error(`ANTHROPIC_CUSTOM_HEADERS không hợp lệ: ${line}`);
        }
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

export const config = {
  apiKey,
  authToken,
  baseURL: process.env.ANTHROPIC_BASE_URL?.trim() || "https://claude-api.zunef.com/v1/ai",
  model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6",
  timeoutMs: positiveInteger(process.env.API_TIMEOUT_MS, 3_000_000),
  customHeaders: parseHeaders(process.env.ANTHROPIC_CUSTOM_HEADERS),
  maxTurns: positiveInteger(process.env.AGENT_MAX_TURNS, 80),
  maxTokens: positiveInteger(process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS, 128_000000),
};
