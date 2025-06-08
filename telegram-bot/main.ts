import { Bot, Context } from "npm:grammy";

const apiKey = Deno.env.get("API_KEY");

type ServicePipeMessage = {
  type: string;
  body: {
    from: {
      chatId: number;
    };
    message: {
      text: string;
    };
  };
};

type ErrorMessage = {
  type: "error";
  body: {
    error: string;
  };
};

const handleUnixConnection = async (bot: Bot<Context>, conn: Deno.Conn) => {
  //read from the connection
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(1024);
  const bytesRead = await conn.read(buffer);
  if (bytesRead !== null) {
    const message = decoder.decode(buffer.subarray(0, bytesRead));

    try {
      const parsed = JSON.parse(message.trim()) as ServicePipeMessage;
      if (parsed.type === "telegram-bot-out") {
        bot.api.sendMessage(parsed.body.from.chatId, parsed.body.message.text);
      }
    } catch (_e) {
    }
  }
};

if (import.meta.main) {
  if (apiKey === undefined) {
    const errorMessage: ErrorMessage = {
      type: "error",
      body: {
        error: "API_KEY environment variable is not set.",
      },
    };
    console.log(JSON.stringify(errorMessage));
    Deno.exit(1);
  }
  const bot = new Bot<Context>(apiKey);
  bot.on("message", (ctx) => {
    const message = {
      type: "telegram-bot-in",
      body: {
        from: {
          chatId: ctx.from?.id ?? 0, // Use 0 if ctx.from is undefined
        },
        message: {
          text: ctx.message.text,
        },
      },
    } as ServicePipeMessage;

    const jsonl = JSON.stringify(message) + "\n";
    console.log(jsonl);
  });

  bot.start();

  //read response from unix socket called /tmp/telegram-bot.sock
  const socketPath = "/tmp/telegram-bot.sock";
  //delete sock if it exists
  try {
    await Deno.remove(socketPath);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      // Socket does not exist, which is fine
    } else {
      const formatted = JSON.stringify({
        type: "error",
        body: {
          error: `Failed to remove existing socket at ${socketPath}: ${
            (e as Error).message
          }`,
        },
      });
      console.error(formatted);
      Deno.exit(1);
    }
  }
  const listener = Deno.listen({ transport: "unix", path: socketPath });
  for await (const conn of listener) {
    await handleUnixConnection(bot, conn);
  }
}
