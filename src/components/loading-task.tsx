"use client";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export const LoadingTask = () => {
  const searchParams = useSearchParams();
  const { organization_slug } = useParams<{ organization_slug: string }>();
  const runId = React.useMemo(
    () => searchParams.get("runId") ?? "",
    [searchParams],
  );
  const publicAccessToken = React.useMemo(
    () => searchParams.get("publicAccessToken") ?? "",
    [searchParams],
  );
  const router = useRouter();

  const { run, error } = useRealtimeRun(runId, {
    accessToken: publicAccessToken,
    onComplete: (run) => {
      if (run.status === "COMPLETED") {
        router.push(`/${organization_slug}`);
      }
    },
    enabled: !!runId && !!publicAccessToken,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!run) {
    return null;
  }

  return <div>LoadingTask</div>;
};
