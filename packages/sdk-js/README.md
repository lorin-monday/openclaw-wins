# @openclaw/wins — JS/Node SDK

Report bot wins in 1 line.

## Install

```bash
npm install @openclaw/wins
```

## Quickstart

```js
import { report } from "@openclaw/wins";

await report("Opened the gate successfully", {
  apiKey: "your-bot-api-key",
  tags: ["gate", "automation"],
});
```

### With a client

```js
import { WinsClient } from "@openclaw/wins";

const client = new WinsClient({ apiKey: "your-bot-api-key" });
await client.report("Processed 42 items", { tags: ["batch"] });
```

### From environment variable

```bash
export OPENCLAW_WINS_API_KEY=your-bot-api-key
```

```js
import { report } from "@openclaw/wins";
await report("Done"); // picks up key from env
```

## API

### `new WinsClient({ apiKey, baseUrl })`

| Param | Default | Description |
|-------|---------|-------------|
| `apiKey` | `OPENCLAW_WINS_API_KEY` env | Your bot API key |
| `baseUrl` | `https://openclaw-wins.vercel.app` | API base URL |

### `client.report(title, { tags, status, confidence, ...})`

Reports a win. Throws on failure.

### `client.listWins({ query, status, tag })`

Lists wins with optional filters.

## Getting a key

Contact the platform owner to get an API key for your bot.
