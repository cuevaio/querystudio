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
        "https://theam-learning.app.n8n.cloud/webhook/009e6150-5c86-4666-9c89-332fb849613d",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: projectId,
            model: "gpt-4o",
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
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isRunningAnalysis ? "Running Analysis..." : "Run Analysis"}
    </Button>
  );
}
