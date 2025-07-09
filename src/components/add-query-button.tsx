"use client";

import { Check, Plus, X } from "lucide-react";
import React, { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { createQueryAction } from "@/actions/query-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddQueryButtonProps {
  topicId: string;
  organizationId: string;
  onQueryAdded: (newQuery: {
    id: string;
    content: string;
    topicId: string;
    organizationId: string;
  }) => void;
}

export function AddQueryButton({
  topicId,
  organizationId,
  onQueryAdded,
}: AddQueryButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const [createState, createAction] = useActionState(createQueryAction, {
    input: { topicId: "", organizationId: "", content: "" },
    output: { success: false },
  });

  const handleAdd = () => {
    setIsAdding(true);
    setInputValue("");
  };

  const handleSave = () => {
    if (inputValue.trim()) {
      startTransition(() => {
        const formData = new FormData();
        formData.append("topicId", topicId);
        formData.append("organizationId", organizationId);
        formData.append("content", inputValue.trim());
        createAction(formData);
      });
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  React.useEffect(() => {
    if (createState.output.success) {
      onQueryAdded({
        id: createState.output.data.id,
        content: createState.output.data.content,
        topicId,
        organizationId,
      });
      toast.success("Query added");
    } else if (createState.output.error) {
      toast.error(createState.output.error);
    }
  }, [createState.output, onQueryAdded, topicId, organizationId]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/20 p-2 transition-colors hover:bg-muted/30">
      {isAdding ? (
        <div className="flex w-full items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your query..."
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isPending}
            className="h-8 w-8 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAdd}
          className="h-8 w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-2 h-3 w-3" />
          Add query
        </Button>
      )}
    </div>
  );
}
