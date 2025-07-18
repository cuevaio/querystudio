"use client";

import { ArrowLeft, Edit, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
  type DeleteTopicActionState,
  deleteTopicAction,
  type UpdateTopicActionState,
  updateTopicAction,
} from "@/actions/topic-actions";
import { CreateQueryModal } from "@/components/create-query-modal";
import { QueryActionsMenu } from "@/components/query-actions-menu";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TopicPageClientProps {
  topicData: {
    id: string;
    name: string;
    description: string | null;
    projectId: string | null;
    project: {
      id: string;
      name: string;
      slug: string | null;
      description?: string | null;
    } | null;
    queries: Array<{
      id: string;
      text: string;
      queryType: string | null;
    }>;
  };
  organizationSlug: string;
}

export function TopicPageClient({
  topicData,
  organizationSlug,
}: TopicPageClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  // Track the current displayed values (these will update when server action succeeds)
  const [currentName, setCurrentName] = React.useState(topicData.name);
  const [currentDescription, setCurrentDescription] = React.useState(
    topicData.description || "",
  );

  const [updateState, updateFormAction, isUpdating] = React.useActionState(
    updateTopicAction,
    {
      input: { topicId: "", name: "", description: "" },
      output: { success: false },
    } as UpdateTopicActionState,
  );

  const [deleteState, deleteFormAction, isDeleting] = React.useActionState(
    deleteTopicAction,
    {
      input: { topicId: "" },
      output: { success: false },
    } as DeleteTopicActionState,
  );

  // Handle update success
  React.useEffect(() => {
    if (updateState.output.success && updateState.output.data) {
      setIsEditing(false);
      toast.success("Topic updated successfully");
      // Update both edit state and current displayed values with the actual returned data
      const { name, description } = updateState.output.data;
      setCurrentName(name);
      setCurrentDescription(description);
    } else if (!updateState.output.success && updateState.output.error) {
      toast.error(updateState.output.error);
    }
  }, [updateState.output]);

  // Handle delete success
  React.useEffect(() => {
    if (deleteState.output.success) {
      toast.success("Topic deleted successfully");
      // Redirect to organization page
      router.push(`/${organizationSlug}`);
    } else if (!deleteState.output.success && deleteState.output.error) {
      toast.error(deleteState.output.error);
    }
  }, [deleteState.output, organizationSlug, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href={`/${organizationSlug}`}>
            <Button variant="ghost" className="h-auto p-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {topicData.project?.name}
            </Button>
          </Link>
        </div>

        {/* Topic Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            {isEditing ? (
              <div className="flex-1">
                <form action={updateFormAction} className="space-y-4">
                  <input type="hidden" name="topicId" value={topicData.id} />

                  <div>
                    <Label htmlFor="edit-name">Topic Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={currentName}
                      className="mt-1"
                      disabled={isUpdating}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      defaultValue={currentDescription}
                      className="mt-1"
                      rows={3}
                      disabled={isUpdating}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isUpdating}>
                      <Save className="mr-2 h-4 w-4" />
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      size="sm"
                      disabled={isUpdating}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex-1">
                <h1 className="mb-2 font-bold text-3xl">{currentName}</h1>
                <p className="mb-4 text-muted-foreground">
                  {currentDescription}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {topicData.queries.length} quer
                    {topicData.queries.length !== 1 ? "ies" : "y"}
                  </Badge>
                  <Badge variant="outline">{topicData.project?.name}</Badge>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{currentName}"? This
                        will also delete all queries associated with this topic.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form
                        action={deleteFormAction}
                        style={{ display: "inline" }}
                      >
                        <input
                          type="hidden"
                          name="topicId"
                          value={topicData.id}
                        />
                        <AlertDialogAction
                          type="submit"
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Topic"}
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        {/* Queries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">Queries</h2>
            <CreateQueryModal
              topicId={topicData.id}
              projectId={topicData.projectId || ""}
              organizationSlug={organizationSlug}
              companyName={topicData.project?.name || ""}
              topicName={currentName}
              topicDescription={currentDescription}
              existingQueries={topicData.queries}
              companyDescription={topicData.project?.description || undefined}
            />
          </div>

          {topicData.queries.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>No queries found for this topic.</p>
                  <p className="mt-2 text-sm">
                    Click "Add Query" to create your first query.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topicData.queries.map((queryItem, index) => (
                <Card
                  key={queryItem.id}
                  className="border-border/50 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Link
                            href={`/${organizationSlug}/${topicData.id}/${queryItem.id}`}
                            className="hover:underline"
                          >
                            <CardTitle className="font-medium text-lg">
                              {queryItem.text}
                            </CardTitle>
                          </Link>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Badge
                          variant={
                            queryItem.queryType === "product"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {queryItem.queryType === "product"
                            ? "Company"
                            : "Market"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <QueryActionsMenu
                          queryId={queryItem.id}
                          queryText={queryItem.text}
                          organizationSlug={organizationSlug}
                          topicId={topicData.id}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Queries:</span>
                <span className="ml-2 text-muted-foreground">
                  {topicData.queries.length}
                </span>
              </div>
              <div>
                <span className="font-medium">Topic:</span>
                <span className="ml-2 text-muted-foreground">
                  {currentName}
                </span>
              </div>
              <div>
                <span className="font-medium">Company Queries:</span>
                <span className="ml-2 text-muted-foreground">
                  {
                    topicData.queries.filter((q) => q.queryType === "product")
                      .length
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">Market Queries:</span>
                <span className="ml-2 text-muted-foreground">
                  {
                    topicData.queries.filter((q) => q.queryType === "sector")
                      .length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
