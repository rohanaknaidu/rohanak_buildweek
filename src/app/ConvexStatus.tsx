"use client";

import { ConvexHttpClient } from "convex/browser";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export function ConvexStatus() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <p className="text-sm text-amber-700">
        Convex URL is not configured for this environment.
      </p>
    );
  }

  return <ConvexStatusInner />;
}

function ConvexStatusInner() {
  const [status, setStatus] = useState<{
    ok: boolean;
    service: string;
    milestone: string;
  } | null>(null);

  useEffect(() => {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    void client.query(api.health.status).then(setStatus);
  }, []);

  if (status === null) {
    return <p className="text-sm text-zinc-500">Checking Convex...</p>;
  }

  return (
    <p className="text-sm font-medium text-emerald-700">
      Convex connected: {status.service} {status.milestone}
    </p>
  );
}
