const lines = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream());

type ServicePipeMessage = {
  type: string;
  body: {
    message: {
      text: string;
    };
  };
};

for await (const line of lines) {
  let parsed: ServicePipeMessage | undefined;
  try {
    parsed = JSON.parse(line.trim()) as ServicePipeMessage;
  } catch (_error) {
    console.log(line.trim());
    continue;
  }
  if (
    !parsed || !parsed.body || !parsed.body.message || !parsed.body.message.text
  ) {
    console.log(line.trim());
    continue;
  }

  if (parsed.type !== "telegram-bot-in") {
    console.log(line.trim());
    continue;
  }

  parsed.type = "telegram-bot-out";

  const response = JSON.stringify(parsed) + "\n";
  console.log(response);

  // //write to /tmp/telegram-bot.sock
  const socketPath = "/tmp/telegram-bot.sock";
  try {
    const conn = await Deno.connect({ path: socketPath, transport: "unix" });
    await conn.write(new TextEncoder().encode(response));
    conn.close();
  } catch (error) {
    const errorMessage = {
      type: "error",
      body: {
        error: `Failed to connect to ${socketPath}: ${
          (error as Error).message
        }`,
      },
    };
    const formatted = JSON.stringify(errorMessage) + "\n";
    console.error(formatted);
  }
}
