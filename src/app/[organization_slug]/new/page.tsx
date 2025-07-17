"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import {
  type CreateTopicFromSlugActionState,
  createTopicFromSlugAction,
} from "@/actions/topic-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewTopicPage() {
  const params = useParams();
  const organization_slug = params.organization_slug as string;
  const router = useRouter();
  const [state, formAction, isPending] = React.useActionState(
    createTopicFromSlugAction,
    {
      input: {
        organizationSlug: "",
        name: "",
        description: "",
      },
      output: { success: false },
    } as CreateTopicFromSlugActionState,
  );

  React.useEffect(() => {
    if (state.output.success) {
      router.push(`/${organization_slug}/${state.output.data.id}`);
    }
  }, [organization_slug, router, state.output]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href={`/${organization_slug}`}>
            <Button variant="ghost" className="h-auto p-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organization
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Create New Topic</h1>
          <p className="text-muted-foreground">
            Add a new topic to organize your research queries
          </p>
        </div>

        {/* Error Display */}
        {state.output.success === false && state.output.error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive text-sm">
            {state.output.error}
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Details</CardTitle>
            <CardDescription>
              Provide a name and description for your new topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <input
                type="hidden"
                name="organizationSlug"
                value={organization_slug}
              />

              <div className="space-y-2">
                <Label htmlFor="name">Topic Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter topic name"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this topic will cover"
                  rows={4}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Topic"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={isPending}
                >
                  <Link href={`/${organization_slug}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
