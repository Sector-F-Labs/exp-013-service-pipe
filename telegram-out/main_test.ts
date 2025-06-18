import { fromExp13, Exp13Message } from "./main.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
  }
}

Deno.test("fromExp13 converts message", () => {
  const outgoing = {
    message_type: { type: "TextMessage", data: { text: "hi" } },
    timestamp: "2023-12-01T10:30:00Z",
    target: { platform: "telegram" },
  };
  const msg: Exp13Message = {
    type: "telegram_out",
    header: { request: "id", timestamp: "2023-12-01T10:30:00Z" },
    body: outgoing,
  };
  const result = fromExp13(msg);
  assertEquals(result, outgoing);
});
