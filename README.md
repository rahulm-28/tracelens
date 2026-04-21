# TraceLens

**Open-source LLM observability and evaluation platform — built for teams on the Microsoft AI stack.**

> ⚠️ **Active development — Phase 1 (Foundation) in progress.** Core auth, multi-tenancy, and deployment infrastructure being built. Follow along or star to track progress.

---

## What is TraceLens?

TraceLens captures every model call, tool invocation, and agent decision in your LLM-powered application as a structured trace — and surfaces it through a console you can run yourself.

It is built specifically for teams using **Azure OpenAI, Azure AI Foundry, and Copilot Studio**. Every other LLM observability platform treats Azure as a generic OpenAI wrapper. TraceLens models it natively: deployment names, regions, content filter results, and per-deployment cost attribution are first-class fields, not metadata bags.

**Core capabilities (v1):**

- **Trace ingestion** — lightweight TypeScript SDK wraps your existing Azure OpenAI client; every call becomes a structured span, buffered and flushed asynchronously with sub-2ms overhead
- **Waterfall trace viewer** — visualize multi-step agent runs as a tree; click any span to inspect inputs, outputs, errors, and Azure content filter results
- **Analytics** — volume, latency percentiles, cost breakdown by model and Azure deployment, content filter trigger rates
- **Prompt registry** — version your prompts, fetch them from the SDK with client-side caching, diff versions side by side
- **Evaluation runner** — run a prompt version against a dataset, compare two runs, catch regressions before production
- **Azure-native** — `azure_deployment`, `azure_region`, `content_filter_results` are top-level span fields with dedicated UI rendering
- **Self-hostable** — `docker compose up` brings up everything: Postgres, Redis, API, worker, and web console

---

## Why not just use Langfuse / LangSmith / Helicone?

|                                  | Langfuse     | LangSmith       | Helicone      | TraceLens                  |
| -------------------------------- | ------------ | --------------- | ------------- | -------------------------- |
| Open source                      | ✅ MIT       | ❌              | ✅ Apache 2.0 | ✅ MIT                     |
| Self-hostable                    | ✅ (complex) | Enterprise only | ✅            | ✅ Single `docker compose` |
| Azure deployment-level telemetry | ❌ Generic   | ❌ Via wrappers | ❌ Generic    | ✅ Native                  |
| Azure content filter results     | ❌           | ❌              | ❌            | ✅ First-class fields      |
| Copilot Studio / AI Foundry      | ❌           | ❌              | ❌            | 🔜 v2                      |

Langfuse is the closest OSS alternative and it's excellent. If you're not on the Microsoft AI stack, use it. If you are — the operational telemetry Azure exposes (deployment routing, content filters, quota context) gets silently discarded by every other tool. TraceLens captures it.

---

## Architecture

```
Your App
  └── @tracelens/sdk (TypeScript)
        └── ring buffer → async flush
              └── POST /v1/traces (X-API-Key)
                    └── Zod validation
                          └── BullMQ (Redis)
                                └── Worker
                                      └── Batch INSERT → PostgreSQL (partitioned)

Console (React SPA)
  └── JWT-authenticated API
        └── Trace list / detail, analytics, prompts, evals
```

**Stack:** Node.js · TypeScript · Express · PostgreSQL 16 (partitioned) · BullMQ/Redis · React 18 · TanStack Router · TanStack Query · Drizzle ORM · Tailwind CSS · Zod

**Key decisions:**

- **PostgreSQL with monthly range partitioning** (not ClickHouse) — single-database operational simplicity, partition pruning keeps queries fast, DROP PARTITION for retention cleanup
- **Async ingestion with queue backpressure** — 202 Accepted after enqueue; database health never blocks your LLM calls; 429 when queue depth exceeds threshold
- **Client-generated UUIDs for idempotency** — SDK retries are safe by default via `ON CONFLICT DO NOTHING`
- **Drizzle over Prisma** — SQL-first query builder; complex analytics queries (window functions, CTEs, partition-aware aggregates) written as raw SQL without fighting the ORM
- **Azure fields as columns, not JSON** — `azure_deployment`, `azure_region`, `content_filter_results` are indexed columns; filter-by-deployment queries are efficient and plan-friendly

Full rationale in [SPEC.md](./SPEC.md).

---

## Quickstart (self-host)

> Available once Phase 2 (ingestion) ships. Tracking issue: #TODO

```bash
git clone https://github.com/rahum-28/tracelens
cd tracelens
cp .env.example .env          # fill in JWT_SECRET and DB_PASSWORD
docker compose up             # postgres + redis + api + worker + web
```

Open `http://localhost:3000`, sign up, create a project, copy the API key.

```bash
npm install @tracelens/sdk
```

```typescript
import { TraceLens } from '@tracelens/sdk';
import { AzureOpenAI } from 'openai';

const tl = new TraceLens({ apiKey: 'tl_...' });
const client = tl.instrumentAzureOpenAI(new AzureOpenAI({ ... }));

// Use client normally — every call is now a traced span
const response = await client.chat.completions.create({ ... });
```

---

## Build status

| Phase       | Scope                                                                | Status         |
| ----------- | -------------------------------------------------------------------- | -------------- |
| **Phase 1** | Auth, multi-tenancy, org/project/API key management, deploy pipeline | 🔨 In progress |
| **Phase 2** | Trace ingestion, SDK, waterfall viewer                               | 🔜             |
| **Phase 3** | Azure fields, analytics, prompt registry                             | 🔜             |
| **Phase 4** | Evaluation runner, self-host docker compose, public launch           | 🔜             |

Target: 12 weeks from project start. Following the spec in [SPEC.md](./SPEC.md).

---

## Repository structure

```
tracelens/
├── apps/
│   ├── api/          # Node.js + Express — ingestion + console API + worker
│   ├── web/          # React 18 + Vite — the console SPA
│   └── worker/       # BullMQ worker process
├── packages/
│   ├── sdk/          # @tracelens/sdk — published to npm
│   └── shared/       # Zod schemas, types shared across packages
├── SPEC.md           # Full product and engineering specification
└── docker-compose.yml
```

---

## Specification

The full product spec, data model, ADRs, API surface, SDK contract, and phased roadmap live in [SPEC.md](./SPEC.md). It is the authoritative source for every architectural decision. If code and SPEC conflict, SPEC wins (or the SPEC needs updating with documented rationale).

---

## Non-goals (v1)

Capturing these here because scope is a real thing:

- No Copilot Studio or AI Foundry ingestion (v2)
- No Python SDK (v2)
- No managed cloud tier — self-host only
- No SSO/SAML (v2)
- No proxy-based ingestion (SDK-only is intentional)
- No LLM-as-judge evaluators (v2)
- No PII scrubbing (v2 — SDK user controls what is sent)

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Author

Built by [Rahul Mittal](https://github.com/rahulm-28) — Power Platform & M365 Lead at Binary Republik, building TraceLens as a portfolio project demonstrating production-grade backend engineering on the Microsoft AI stack.
