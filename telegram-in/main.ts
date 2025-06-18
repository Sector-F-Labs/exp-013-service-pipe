import { Kafka } from "npm:kafkajs";

export interface IncomingMessage {
  message_type: unknown;
  timestamp: string;
  source: unknown;
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

export function toExp13(msg: IncomingMessage): Exp13Message {
  return {
    type: "telegram_in",
    header: {
      request: crypto.randomUUID(),
      timestamp: msg.timestamp,
    },
    body: msg,
  }; 
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

async function consumeKafka() {
  const brokers = (Deno.env.get("KAFKA_BROKERS") || "").split(",").filter(Boolean);
  const topic = Deno.env.get("KAFKA_IN_TOPIC") || "telegram_in";
  if (brokers.length === 0) throw new Error("KAFKA_BROKERS not set");
  const kafka = new Kafka({ brokers });
  const consumer = kafka.consumer({ groupId: "telegram-in" });
  await consumer.connect();
  await consumer.subscribe({ topic });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      try {
        const msg = JSON.parse(message.value.toString()) as IncomingMessage;
        const out = toExp13(msg);
        console.log(JSON.stringify(out));
      } catch (err) {
        console.error(
          JSON.stringify({
            type: "log",
            header: {
              request: crypto.randomUUID(),
              program: "telegram-in",
              timestamp: new Date().toISOString(),
            },
            body: { level: "error", message: (err as Error).message },
          }),
        );
      }
    },
  });
}

if (import.meta.main) {
  const brokers = Deno.env.get("KAFKA_BROKERS");
  if (brokers) {
    await consumeKafka();
  } else {
    for await (const line of readLines(Deno.stdin)) {
      if (line.trim().length === 0) continue;
      try {
        const msg = JSON.parse(line) as IncomingMessage;
        const out = toExp13(msg);
        console.log(JSON.stringify(out));
      } catch (err) {
        console.error(
          JSON.stringify({
            type: "log",
            header: {
              request: crypto.randomUUID(),
              program: "telegram-in",
              timestamp: new Date().toISOString(),
            },
            body: { level: "error", message: (err as Error).message },
          }),
        );
      }
    }
  }
}
