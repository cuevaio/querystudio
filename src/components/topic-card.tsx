"use client";

import { Check, Trash2, X } from "lucide-react";
import React, { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteTopicAction, updateTopicAction } from "@/actions/topic-actions";
import { AddQueryButton } from "@/components/add-query-button";
import { QueryItem } from "@/components/query-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface TopicCardProps {
  topic: {
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
  };
  onTopicUpdated: (topicId: string, newName: string) => void;
  onTopicDeleted: (topicId: string) => void;

  onQueryAdded: (newQuery: {
    id: string;
    text: string;
    topicId: string;
    projectId: string;
  }) => void;
  onQueryUpdated: (
    topicId: string,
    queryId: string,
    newContent: string,
  ) => void;
  onQueryDeleted: (topicId: string, queryId: string) => void;
}

export function TopicCard({
  topic,
  onTopicDeleted,
  onTopicUpdated,
  onQueryAdded,
  onQueryUpdated,
  onQueryDeleted,
}: TopicCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(topic.name);
  const [isPending, startTransition] = useTransition();

  const [updateState, updateAction] = useActionState(updateTopicAction, {
    input: { topicId: "", name: "", description: "" },
    output: { success: false },
  });

  const [deleteState, deleteAction] = useActionState(deleteTopicAction, {
    input: { topicId: "" },
    output: { success: false },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(topic.name);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== topic.name) {
      startTransition(() => {
        const formData = new FormData();
        formData.append("topicId", topic.id);
        formData.append("name", editValue.trim());
        updateAction(formData);
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(topic.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDelete = () => {
    startTransition(() => {
      const formData = new FormData();
      formData.append("topicId", topic.id);
      deleteAction(formData);
    });
  };

  // Handle successful deletion
  React.useEffect(() => {
    if (deleteState.output.success) {
      onTopicDeleted(topic.id);
      toast.success("Topic deleted");
    } else if (deleteState.output.error) {
      toast.error(deleteState.output.error);
    }
  }, [deleteState.output, onTopicDeleted, topic.id]);

  React.useEffect(() => {
    if (updateState.output.success) {
      onTopicUpdated(topic.id, editValue);
      toast.success("Topic updated");
    } else if (updateState.output.error) {
      toast.error(updateState.output.error);
    }
  }, [updateState.output, onTopicUpdated, topic.id, editValue]);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 font-medium text-base"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="cursor-pointer text-left font-medium text-base transition-colors hover:text-muted-foreground"
                onClick={handleEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleEdit();
                  }
                }}
              >
                {topic.name}
              </button>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete topic</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this topic? This action cannot
                  be undone and will also delete all queries in this topic.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-muted-foreground text-sm">{topic.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {topic.queries.map((query) => (
            <QueryItem
              key={query.id}
              query={query}
              onQueryDeleted={onQueryDeleted}
              onQueryUpdated={onQueryUpdated}
            />
          ))}
          <AddQueryButton
            topicId={topic.id}
            projectId={topic.projectId}
            onQueryAdded={onQueryAdded}
          />
        </div>
      </CardContent>
    </Card>
  );
}
