"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  type DeleteQueryActionState,
  deleteQueryAction,
  type UpdateQueryActionState,
  updateQueryAction,
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
  queryText: string;
}

export function QueryActionsMenu({
  queryId,
  queryText,
}: QueryActionsMenuProps) {
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const [updateState, updateFormAction, isUpdating] = React.useActionState(
    updateQueryAction,
    {
      input: { queryId: "", text: "" },
      output: { success: false },
    } as UpdateQueryActionState,
  );

  const [deleteState, deleteFormAction, isDeleting] = React.useActionState(
    deleteQueryAction,
    {
      input: { queryId: "" },
      output: { success: false },
    } as DeleteQueryActionState,
  );

  // Handle update success
  React.useEffect(() => {
    if (updateState.output.success) {
      setShowEditDialog(false);
      toast.success("Query updated successfully");
    } else if (!updateState.output.success && updateState.output.error) {
      toast.error(updateState.output.error);
    }
  }, [updateState.output]);

  // Handle delete success
  React.useEffect(() => {
    if (deleteState.output.success) {
      setShowDeleteDialog(false);
      toast.success("Query deleted successfully");
    } else if (!deleteState.output.success && deleteState.output.error) {
      toast.error(deleteState.output.error);
    }
  }, [deleteState.output]);

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
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Query
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
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
          <form action={updateFormAction} className="space-y-4">
            <input type="hidden" name="queryId" value={queryId} />

            <div>
              <Label htmlFor="text">Query Text</Label>
              <Input
                id="text"
                name="text"
                defaultValue={queryText}
                placeholder="Enter query text..."
                className="mt-2"
                disabled={isUpdating}
                required
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdating}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Query"}
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <form action={deleteFormAction} style={{ display: "inline" }}>
              <input type="hidden" name="queryId" value={queryId} />
              <AlertDialogAction
                type="submit"
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Query"}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
