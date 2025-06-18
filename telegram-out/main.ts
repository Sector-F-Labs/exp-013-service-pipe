export interface OutgoingMessage {
  message_type: unknown;
  timestamp: string;
  target: unknown;
  [key: string]: unknown;
}

export interface Exp13Message {
  type: string;
  header: {
    request: string;
    timestamp: string;
  };
  body: unknown;
}

export function fromExp13(msg: Exp13Message): OutgoingMessage | null {
  if (msg.type !== "telegram_out") return null;
  return msg.body as OutgoingMessage;
}

async function* readLines(reader: { read(p: Uint8Array): Promise<number | null> }): AsyncIterable<string> {
  const decoder = new TextDecoder();
  const buf = new Uint8Array(1024);
  let leftover = "";
  while (true) {
    const n = await reader.read(buf);
    if (n === null) {
      if (leftover.length > 0) yield leftover;
      break;
    }
    const chunk = decoder.decode(buf.subarray(0, n));
    const lines = (leftover + chunk).split(/\r?\n/);
    leftover = lines.pop() ?? "";
    for (const line of lines) {
      yield line;
    }
  }
}

if (import.meta.main) {
  for await (const line of readLines(Deno.stdin)) {
    if (line.trim().length === 0) continue;
    try {
      const msg = JSON.parse(line) as Exp13Message;
      const outgoing = fromExp13(msg);
      if (outgoing) {
        console.log(JSON.stringify(outgoing));
      }
    } catch (err) {
      console.error(
        JSON.stringify({
          type: "log",
          header: {
            request: crypto.randomUUID(),
            program: "telegram-out",
            timestamp: new Date().toISOString(),
          },
          body: {
            level: "error",
            message: (err as Error).message,
          },
        }),
      );
    }
  }
}
