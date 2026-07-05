import type Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "node:fs";
import path from "node:path";

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "list_files",
    description: "Liệt kê file và thư mục trong một thư mục thuộc workspace.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Đường dẫn tương đối, mặc định là thư mục gốc." },
      },
    },
  },
  {
    name: "read_file",
    description: "Đọc nội dung UTF-8 của một file trong workspace.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string", description: "Đường dẫn tương đối đến file." } },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Tạo hoặc ghi đè một file UTF-8 trong workspace. Tự tạo thư mục cha nếu cần.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Đường dẫn tương đối đến file." },
        content: { type: "string", description: "Toàn bộ nội dung mới của file." },
      },
      required: ["path", "content"],
    },
  },
];

const workspace = path.resolve(process.cwd());

function safePath(relativePath = "."): string {
  const target = path.resolve(workspace, relativePath);
  const relative = path.relative(workspace, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Đường dẫn nằm ngoài workspace.");
  }
  return target;
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Tool input phải là một object.");
  }
  return input as Record<string, unknown>;
}

function stringField(input: Record<string, unknown>, name: string): string {
  const value = input[name];
  if (typeof value !== "string") throw new Error(`Trường ${name} phải là string.`);
  return value;
}

export async function executeTool(name: string, rawInput: unknown): Promise<string> {
  try {
    const input = asRecord(rawInput);

    switch (name) {
      case "list_files": {
        const requestedPath = typeof input.path === "string" ? input.path : ".";
        const entries = await fs.readdir(safePath(requestedPath), { withFileTypes: true });
        return entries
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((entry) => `${entry.isDirectory() ? "[dir] " : "[file]"} ${entry.name}`)
          .join("\n");
      }
      case "read_file":
        return await fs.readFile(safePath(stringField(input, "path")), "utf8");
      case "write_file": {
        const target = safePath(stringField(input, "path"));
        const content = stringField(input, "content");
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, content, "utf8");
        return `Đã ghi ${Buffer.byteLength(content, "utf8")} byte vào ${path.relative(workspace, target)}.`;
      }
      default:
        throw new Error(`Tool không tồn tại: ${name}`);
    }
  } catch (error) {
    return `Lỗi: ${error instanceof Error ? error.message : String(error)}`;
  }
}
