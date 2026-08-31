"use client";

import { useQuery } from "convex/react";
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
  const status = useQuery(api.health.status);

  if (status === undefined) {
    return <p className="text-sm text-zinc-500">Checking Convex...</p>;
  }

  return (
    <p className="text-sm font-medium text-emerald-700">
      Convex connected: {status.service} {status.milestone}
    </p>
  );
}
