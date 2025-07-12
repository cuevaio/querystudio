"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteQueryAction, updateQueryAction } from "@/actions/query-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QueryActionsMenuProps {
  queryId: string;
  organizationSlug: string;
  topicId: string;
}

export function QueryActionsMenu({
  queryId,
  organizationSlug,
  topicId,
}: QueryActionsMenuProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [updateState, updateAction] = useActionState(updateQueryAction, {
    input: { queryId: "", text: "" },
    output: { success: false },
  });

  const [deleteState, deleteAction] = useActionState(deleteQueryAction, {
    input: { queryId: "" },
    output: { success: false },
  });

  const handleEditClick = () => {
    setShowEditDialog(true);
    setEditValue("");
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleUpdateSubmit = (formData: FormData) => {
    if (!editValue.trim()) {
      toast.error("Query content cannot be empty");
      return;
    }

    startTransition(() => {
      formData.append("queryId", queryId);
      formData.append("content", editValue.trim());
      updateAction(formData);
    });
  };

  const handleDeleteConfirm = () => {
    startTransition(() => {
      const formData = new FormData();
      formData.append("queryId", queryId);
      deleteAction(formData);
    });
  };

  // Handle successful update
  React.useEffect(() => {
    if (updateState.output.success) {
      setShowEditDialog(false);
      setEditValue("");
      toast.success("Query updated successfully");
      router.refresh();
    } else if (updateState.output.error) {
      toast.error(updateState.output.error);
    }
  }, [updateState.output, router]);

  // Handle successful deletion
  React.useEffect(() => {
    if (deleteState.output.success) {
      toast.success("Query deleted successfully");
      router.push(`/${organizationSlug}/${topicId}`);
    } else if (deleteState.output.error) {
      toast.error(deleteState.output.error);
    }
  }, [deleteState.output, router, organizationSlug, topicId]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Query
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Query
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Query</AlertDialogTitle>
            <AlertDialogDescription>
              Update the content of this query. Make sure it's clear and
              specific.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={handleUpdateSubmit}>
            <div className="py-4">
              <Label htmlFor="content">Query Content</Label>
              <Input
                id="content"
                name="content"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter query content..."
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={isPending || !editValue.trim()}
              >
                {isPending ? "Updating..." : "Update Query"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Query</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this query? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete Query"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
