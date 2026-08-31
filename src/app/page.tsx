import { ConvexStatus } from "./ConvexStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-sm text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
          M0 Foundation
        </p>
        <h1 className="text-4xl font-semibold tracking-normal">
          Did You Know?
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          V1 foundation is running with Next.js, TypeScript, Tailwind CSS, and
          Convex.
        </p>
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <ConvexStatus />
        </div>
      </section>
    </main>
  );
}
