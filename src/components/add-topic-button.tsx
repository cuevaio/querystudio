"use client";

import { Plus } from "lucide-react";
import React, { useActionState } from "react";
import { createTopicAction } from "@/actions/topic-actions";
import { Button } from "./ui/button";

interface AddTopicButtonProps {
  projectId: string;
  onTopicAdded: (newTopic: {
    id: string;
    name: string;
    description: string;
    projectId: string;
    queries: Array<{
      id: string;
      text: string;
      topicId: string;
      projectId: string;
    }>;
  }) => void;
}

const randomTopicNames = [
  "Features",
  "Security",
  "Pricing",
  "Support",
  "Integration",
  "Performance",
  "Comparison",
  "Benefits",
  "Documentation",
  "API",
  "Updates",
  "Mobile",
  "Desktop",
  "Analytics",
  "Automation",
  "Workflow",
  "Collaboration",
  "Reporting",
  "Customization",
  "Deployment",
];

export function AddTopicButton({
  projectId,
  onTopicAdded,
}: AddTopicButtonProps) {
  const [createState, createAction, isPending] = useActionState(
    createTopicAction,
    {
      input: { projectId: "", name: "", description: "" },
      output: { success: false },
    },
  );

  React.useEffect(() => {
    if (createState.output.success && "data" in createState.output) {
      const topicId = createState.output.data.id;
      onTopicAdded({
        id: topicId,
        name: createState.output.data.name,
        description: `Questions and information about ${createState.output.data.name.toLowerCase()}`,
        projectId,
        queries: [],
      });
    }
  }, [createState.output, onTopicAdded, projectId]);

  const randomName = React.useMemo(() => {
    console.log(createState);
    return (
      randomTopicNames[Math.floor(Math.random() * randomTopicNames.length)] ||
      "New Topic"
    );
  }, [createState]);

  return (
    <form action={createAction}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="name" defaultValue={randomName} />
      <input
        type="hidden"
        name="description"
        defaultValue={`Questions and information about ${randomName.toLowerCase()}`}
      />
      <Button
        type="submit"
        disabled={isPending}
        variant="outline"
        className="border-border/50 border-dashed transition-colors hover:border-border hover:bg-muted/30"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Topic
      </Button>
    </form>
  );
}
