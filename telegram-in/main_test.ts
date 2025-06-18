import { toExp13, IncomingMessage } from "./main.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
  }
}

Deno.test("toExp13 converts incoming message", () => {
  const incoming: IncomingMessage = {
    message_type: { type: "TelegramMessage", data: { text: "hi" } },
    timestamp: "2023-12-01T10:30:00Z",
    source: { platform: "telegram" },
  };
  const result = toExp13(incoming);
  assertEquals(result.type, "telegram_in");
  assertEquals(result.header.timestamp, "2023-12-01T10:30:00Z");
  assertEquals(result.body, incoming);
  if (typeof result.header.request !== "string") {
    throw new Error("request should be string");
  }
});
