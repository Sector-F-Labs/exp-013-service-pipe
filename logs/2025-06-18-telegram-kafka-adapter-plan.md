# Telegram Kafka Adapter Plan

### Date & Context
- **Date:** 2025-06-18
- **Engineer(s):** ChatGPT
- **Pipeline Configuration:** Use Ratatoskr as the Telegram \u2194 Kafka bridge. Implement lightweight `telegram-in` and `telegram-out` utilities to interface Kafka with the Exp13 JSONL protocol. The earlier `telegram-bot` and `telegram-responder` programs become unnecessary.

### Objective
Plan how to convert Ratatoskr Kafka messages to the Exp13 protocol and back. This will allow reusing a deployed Ratatoskr instance for handling Telegram I/O while the rest of the pipeline works with Exp13 JSONL streams.

### Plan Overview
1. **Review Ratatoskr message format.** Ratatoskr publishes `IncomingMessage` objects to `KAFKA_IN_TOPIC` and consumes `OutgoingMessage` objects from `KAFKA_OUT_TOPIC`. Examples are documented in Ratatoskr's [Unified Message Types](https://github.com/Sector-F-Labs/ratatoskr/blob/main/docs/unified_message_types.md).
2. **Define Exp13 mapping.** Our protocol requires a JSON object with `type`, `header`, and `body`. Each pipeline message should include a unique `header.request` and `header.timestamp`.
3. **telegram-in utility.**
   - Consume `IncomingMessage` JSON from `KAFKA_IN_TOPIC` via `rdkafka` (Rust) or another Kafka client.
   - Generate a new Exp13 message with:
     - `type`: `telegram_in` (or similar).
     - `header.request`: Kafka message key or UUID.
     - `header.timestamp`: timestamp from the incoming Kafka message.
     - `body`: the original `IncomingMessage` JSON.
   - Emit Exp13 JSONL to stdout for downstream services.
4. **telegram-out utility.**
   - Read Exp13 JSONL from stdin.
   - For messages with `type` `telegram_out`, parse `body` to an `OutgoingMessage` structure.
   - Produce this JSON to `KAFKA_OUT_TOPIC` via Kafka producer.
5. **Error handling & logging.** Use Exp13 `log` messages for errors (failed Kafka writes, parse errors). Pass through unknown message types unchanged.
6. **Testing.** Create unit tests that feed sample Ratatoskr messages to `telegram-in` and verify produced JSONL. Similarly test `telegram-out` to ensure Kafka messages match the expected `OutgoingMessage` schema.
7. **Deployment.** Provide scripts or container configurations to run these utilities alongside Ratatoskr, connecting via environment variables for Kafka broker and topic names.

### Action Items
- Implement `telegram-in` and `telegram-out` utilities following the above plan.
- Add sample configuration and documentation for running with an existing Ratatoskr setup.
- Deprecate the previous `telegram-bot` and `telegram-responder` services in favor of the Kafka-based approach.

### Related Files/Commits
- `docs/protocol.html` – Exp13 protocol definition
- Ratatoskr repository – message format reference
