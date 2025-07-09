"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    enabled: !!runId && !!publicAccessToken,
  });

  React.useEffect(() => {
    if (run?.status === "COMPLETED") {
      router.replace(`/${organization_slug}`);
    }
  }, [run, organization_slug, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Something went wrong
            </CardTitle>
            <CardDescription>
              We encountered an error while creating your topics and queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (["QUEUED", "COMPLETED"].includes(run?.status ?? "")) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-primary"></div>
            </div>
          </div>
        </div>
        <CardTitle className="text-xl">Creating Your Content</CardTitle>
        <CardDescription>
          We're generating personalized topics and queries for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            ✨ Analyzing your company details
          </p>
          <p className="text-muted-foreground text-sm">
            🎯 Generating relevant topics
          </p>
          <p className="text-muted-foreground text-sm">
            📝 Creating sample queries
          </p>
        </div>
        <div className="pt-4">
          <p className="font-medium text-sm">
            This usually takes just a few seconds...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
