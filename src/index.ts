import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ClaudeAgent } from "./agent.js";

const terminal = createInterface({ input, output });
const agent = new ClaudeAgent();

console.log("Claude AI Agent đã sẵn sàng. Gõ /exit để thoát.\n");

try {
  while (true) {
    const prompt = (await terminal.question("Bạn > ")).trim();
    if (!prompt) continue;
    if (prompt === "/exit" || prompt === "/quit") break;

    try {
      const answer = await agent.run(prompt);
      console.log(`\nAgent > ${answer}\n`);
    } catch (error) {
      console.error(`\nLỗi > ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }
} finally {
  terminal.close();
}
