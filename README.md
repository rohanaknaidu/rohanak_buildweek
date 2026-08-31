# Did You Know?

Did You Know? is an asynchronous social knowledge game. The V1 product contract
lives in [PRODUCT_SPEC.md](./PRODUCT_SPEC.md).

## Stack

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Convex
* Vercel
* npm

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment values:

```bash
cp .env.example .env.local
```

Then fill in the required Convex URL in `.env.local`.

Run the development server:

```bash
npm run dev
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Product Decisions

Read `PRODUCT_SPEC.md` before product reasoning or implementation. It is the
source of truth for locked V1 behavior and unresolved product decisions.
