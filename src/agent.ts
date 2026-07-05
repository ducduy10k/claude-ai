import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { config } from "./config.js";
import { executeTool, toolDefinitions } from "./tools.js";

const client = new Anthropic({
  apiKey: config.apiKey ?? null,
  authToken: config.authToken ?? null,
  baseURL: config.baseURL,
  timeout: config.timeoutMs,
  defaultHeaders: config.customHeaders,
});

const systemPrompt = `Bạn là một AI coding agent hữu ích, chính xác và chủ động.
Bạn đang làm việc trong workspace: ${process.cwd()}.
Hãy dùng tool khi cần quan sát hoặc chỉnh sửa file. Không tuyên bố đã sửa file nếu chưa dùng tool.
Trả lời người dùng bằng tiếng Việt, ngắn gọn và nêu rõ kết quả.`;

export class ClaudeAgent {
  private readonly messages: MessageParam[] = [];

  async run(userPrompt: string): Promise<string> {
    this.messages.push({ role: "user", content: userPrompt });

    for (let turn = 1; turn <= config.maxTurns; turn++) {
      // Zunef trả về SSE, vì vậy luôn dùng streaming transport rồi lấy message
      // hoàn chỉnh. Cách này vẫn giữ nguyên vòng lặp tool-use phía dưới.
      const stream = client.messages.stream({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemPrompt,
        tools: toolDefinitions,
        messages: this.messages,
      });
      const response = await stream.finalMessage();

      this.messages.push({ role: "assistant", content: response.content });
      const toolUses = response.content.filter((block) => block.type === "tool_use");

      if (toolUses.length === 0) {
        return response.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("\n");
      }

      const results: ToolResultBlockParam[] = await Promise.all(
        toolUses.map(async (toolUse) => ({
          type: "tool_result" as const,
          tool_use_id: toolUse.id,
          content: await executeTool(toolUse.name, toolUse.input),
        })),
      );
      this.messages.push({ role: "user", content: results });
    }

    throw new Error(`Agent đã vượt quá giới hạn ${config.maxTurns} lượt xử lý.`);
  }
}
