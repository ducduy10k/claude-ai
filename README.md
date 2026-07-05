# Claude AI Agent (TypeScript)

AI coding agent dạng CLI, dùng official `@anthropic-ai/sdk` và custom Anthropic base URL.

## Cài đặt

```bash
npm install
cp .env.example .env
```

Điền token (hoặc API key) và model mà gateway hỗ trợ vào `.env`:

```env
ANTHROPIC_AUTH_TOKEN=your_auth_token_here
ANTHROPIC_BASE_URL=https://claude-api.zunef.com/v1/ai
API_TIMEOUT_MS=3000000
ANTHROPIC_MODEL=claude-sonnet-4-6
CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000
ANTHROPIC_CUSTOM_HEADERS="X-ZUNEF-CLIENT: claude-code"
```

Chỉ cần một loại xác thực. `ANTHROPIC_AUTH_TOKEN` được gửi dưới dạng Bearer token;
nếu gateway cấp API key thì có thể dùng `ANTHROPIC_API_KEY` thay thế.

`API_TIMEOUT_MS`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` và `ANTHROPIC_CUSTOM_HEADERS`
được agent truyền trực tiếp vào Claude SDK. Các biến `CLAUDE_CODE_*` còn lại trong
`.env.example` được giữ để tương thích khi dùng cùng môi trường Claude Code.

## Chạy

```bash
npm run dev
```

Build production:

```bash
npm run build
npm start
```

Agent có ba tool nội bộ: `list_files`, `read_file`, và `write_file`. Các tool chỉ được phép truy cập bên trong thư mục nơi lệnh được chạy.
