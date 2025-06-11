# e13 Protocol

In order for this concept to work, the services in question need to follow a particular protocol. As mentioned earlier, all messages sent between programs should be in a JSONL (JSON Lines) format. This means that each line in the file is a valid JSON object, and the file can be read line by line.

Much like HTTP though, simply using bodies of messages is not enough. We need to define a protocol that specifies both information that referers to the object being passed itself, and meta information that describes the message itself. This is similar to HTTP headers, but in this case we will use a JSON object to represent the message.

All types in the following document will be defined in
TypeScript. Quicktype can be used to generate types in other languages or in universal formats like JSON Schema. TypeScript is used here for its simplicity and readability, but the concepts can be easily translated to other languages.

All messages should have the following keys
- type
- header
- body

Type and header are static types, they will always be the same shape, while body is dynamic and can change based on the message type.

### Type
Type is always a string, and it should be a unique identifier for the message type. This allows services to know how to handle the message.

### Header
```typescript
Record<string, string>
```

The header contains metadata about the message. Headers are arbitrary key-value pairs, but there are some reserved keys that should always be present:

#### id
The `id` is a unique identifier for the message. This allows services to track messages and ensure they are processed only once. It is also usefule for tracing and debugging.

```ts
type RequestMessage = {
  type: string;
  header: {
    request: string; // Unique identifier for the request
    timestamp: string; // ISO 8601 timestamp of when the message was created
  };
  body: Record<string, any>; // Actual message content
};
```


```json
{
  "type": "message_type",
  "header": {
    "request": "unique_id",
    "timestamp": "2023-10-01T12:00:00Z"
  },
  "body": {
    // actual message content
  }
}
```
### Reserved types
Typically the string used in the top level type key is used to identify what content will be in the body. Therefore protocol messages can be thought of as discriminated unions. The messages you send between your services are therefore defined by you, however there are some reserved types that are used by the system itself.

#### Log
Messages with log are handled by e13-log service which can be inserted into the pipeline to handle logging. This is useful for debugging and monitoring purposes.

**Type:**
```ts
type LogMessage {
  type: "log";
  header: {
    request: string;
    program: string; 
    context?: string;
    timestamp: string;
  };
  body: {
    level: "info" | "warn" | "error";
    message: string;
    context?: string;
  };
}
```

**Example:**
```json
{
  "type": "log",
  "header": {
    "id": "log_123",
    "timestamp": "2023-10-01T12:00:00Z"
  },
  "body": {
    "level": "info",
    "message": "Service A started successfully.",
    "context": "Service A"
  }
}
```



# Suggested Tooling
- [Quicktype](https://quicktype.io/)

