"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProjectPageClientProps {
  projectId: string;
  organizationSlug: string;
}

export function ProjectPageClient({
  projectId,
  organizationSlug,
}: ProjectPageClientProps) {
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  const handleRunAnalysis = async () => {
    setIsRunningAnalysis(true);

    try {
      const response = await fetch(
        "https://theam-learning.app.n8n.cloud/webhook/llmfindr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: projectId,
            models: [
              "chatgpt-4o-latest",
              "claude-sonnet-4-20250514",
              "google-ai-overview",
              "aifindr",
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to trigger analysis");
      }

      const _result = await response.json();

      toast.success("Analysis started successfully!");

      // Redirect to results page after successful trigger
      window.location.href = `/${organizationSlug}/results`;
    } catch (error) {
      console.error("Error triggering analysis:", error);
      toast.error("Failed to start analysis. Please try again.");
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  return (
    <Button
      onClick={handleRunAnalysis}
      disabled={isRunningAnalysis}
      variant="secondary"
    >
      {isRunningAnalysis ? "Running Analysis..." : "Run Analysis"}
    </Button>
  );
}
