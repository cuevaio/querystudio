"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Plus, Sparkles } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  type CreateQueryActionState,
  createQueryAction,
} from "@/actions/query-actions";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AiGeneratedQuerySchema } from "@/schemas/ai-generated-query";

interface CreateQueryModalProps {
  topicId: string;
  projectId: string;
  organizationSlug: string;
  companyName: string;
  topicName: string;
  topicDescription: string;
  existingQueries: Array<{
    text: string;
    queryType: string | null;
  }>;
  companyDescription?: string;
}

export function CreateQueryModal({
  topicId,
  projectId,
  companyName,
  topicName,
  topicDescription,
  existingQueries,
  companyDescription,
}: CreateQueryModalProps) {
  const [open, setOpen] = React.useState(false);
  const [queryText, setQueryText] = React.useState("");
  const [queryType, setQueryType] = React.useState<string>("");

  const [createState, createFormAction, isCreating] = React.useActionState(
    createQueryAction,
    {
      input: { topicId: "", projectId: "", text: "", queryType: "" },
      output: { success: false },
    } as CreateQueryActionState,
  );

  const {
    object: generatedQuery,
    submit: generateQuery,
    isLoading: isGenerating,
    error: generationError,
  } = useObject({
    api: "/api/ai/completion/query",
    schema: AiGeneratedQuerySchema,
  });

  // Handle create success
  React.useEffect(() => {
    if (createState.output.success) {
      setOpen(false);
      setQueryText("");
      setQueryType("");
      toast.success("Query created successfully");
    } else if (!createState.output.success && createState.output.error) {
      toast.error(createState.output.error);
    }
  }, [createState.output]);

  // Handle AI generation success - populate the inputs
  React.useEffect(() => {
    if (generatedQuery?.text) {
      setQueryText(generatedQuery.text);
    }

    if (generatedQuery?.queryType) {
      setQueryType(generatedQuery.queryType);
    }
  }, [generatedQuery]);

  // Handle generation errors
  React.useEffect(() => {
    if (generationError) {
      toast.error("Failed to generate query. Please try again.");
    }
  }, [generationError]);

  const handleGenerateQuery = () => {
    generateQuery({
      companyName,
      topicName,
      topicDescription,
      existingQueries,
      companyDescription,
    });
  };

  const handleSubmit = (_formData: FormData) => {
    // Override form data with current state values
    const newFormData = new FormData();
    newFormData.append("topicId", topicId);
    newFormData.append("projectId", projectId);
    newFormData.append("text", queryText);
    newFormData.append("queryType", queryType);
    createFormAction(newFormData);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Query
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Query</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new research query to this topic. Choose whether it's about
            your company or the market.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text">Query Text</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateQuery}
                disabled={isGenerating || isCreating}
                className="gap-1 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="text"
              name="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                isGenerating
                  ? "Generating query..."
                  : "Enter your research query..."
              }
              rows={3}
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="queryType">Query Type</Label>
            <Select
              name="queryType"
              value={queryType}
              onValueChange={setQueryType}
              required
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select query type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">
                  Company - About your company/product
                </SelectItem>
                <SelectItem value="sector">
                  Market - About the market/sector
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              onClick={() => {
                setOpen(false);
                setQueryText("");
                setQueryType("");
              }}
              disabled={isCreating}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={isCreating || !queryText.trim() || !queryType}
            >
              {isCreating ? "Creating..." : "Create Query"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
