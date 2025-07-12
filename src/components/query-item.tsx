"use client";

import { Check, Trash2, X } from "lucide-react";
import React, { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteQueryAction, updateQueryAction } from "@/actions/query-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QueryItemProps {
  query: {
    id: string;
    content: string;
    topicId: string;
    projectId: string;
  };
  onQueryDeleted: (topicId: string, queryId: string) => void;
  onQueryUpdated: (
    topicId: string,
    queryId: string,
    newContent: string,
  ) => void;
}

export function QueryItem({
  query,
  onQueryDeleted,
  onQueryUpdated,
}: QueryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(query.content);
  const [, startTransition] = useTransition();

  const [updateState, updateAction, isPendingUpdate] = useActionState(
    updateQueryAction,
    {
      input: { queryId: "", content: "" },
      output: { success: false },
    },
  );

  const [deleteState, deleteAction, isPendingDelete] = useActionState(
    deleteQueryAction,
    {
      input: { queryId: "" },
      output: { success: false },
    },
  );

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(query.content);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== query.content) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("queryId", query.id);
        formData.append("content", editValue.trim());
        updateAction(formData);
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(query.content);
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
      formData.append("queryId", query.id);
      deleteAction(formData);
    });
  };

  // Handle successful deletion
  React.useEffect(() => {
    if (deleteState.output.success) {
      onQueryDeleted(query.topicId, query.id);
    } else if (deleteState.output.error) {
      toast.error(deleteState.output.error);
    }
  }, [deleteState.output, onQueryDeleted, query.topicId, query.id]);

  React.useEffect(() => {
    if (updateState.output.success) {
      setIsEditing(false);
      onQueryUpdated(query.topicId, query.id, editValue.trim());
    } else if (updateState.output.error) {
      toast.error(updateState.output.error);
    }
  }, [updateState.output, onQueryUpdated, query.topicId, query.id, editValue]);

  return (
    <div className="group flex items-center gap-2 rounded-lg bg-muted/30 p-2 transition-colors hover:bg-muted/50">
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              autoFocus
              disabled={isPendingUpdate || isPendingDelete}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isPendingUpdate || isPendingDelete}
              className="h-8 w-8 p-0"
            >
              <Check
                className={cn(
                  "h-3 w-3",
                  isPendingUpdate && "animate-pulse text-green-500",
                )}
              />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPendingUpdate || isPendingDelete}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              "w-full text-left text-sm transition-colors hover:text-muted-foreground",
              isPendingUpdate || (isPendingDelete && "opacity-50"),
              isPendingDelete && "animate-pulse text-destructive",
            )}
            onClick={handleEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleEdit();
              }
            }}
          >
            {query.content}
          </button>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isPendingUpdate || isPendingDelete}
        className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2
          className={cn(
            "h-3 w-3",
            isPendingDelete && "animate-pulse text-destructive",
          )}
        />
      </Button>
    </div>
  );
}
