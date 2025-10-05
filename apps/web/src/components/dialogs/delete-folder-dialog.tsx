"use client";

import { useDeleteFolder } from "@/hooks/folder";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { AlertTriangle } from "lucide-react";
import type { Folder } from "@/types/project";
import { toast } from "sonner";

interface DeleteFolderDialogProps {
  folder: Folder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFolderDialog({
  folder,
  open,
  onOpenChange,
}: DeleteFolderDialogProps) {
  const deleteFolder = useDeleteFolder();

  const handleDelete = () => {
    if (!folder) return;

    deleteFolder.mutate(
      { id: folder.id },
      {
        onSuccess: () => {
          toast.success("Folder deleted successfully!");
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Delete folder error:", error);
          toast.error("Failed to delete folder. Please try again.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Folder</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete the folder "{folder?.name}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {folder && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">{folder.name}</p>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(folder.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteFolder.isPending}
          >
            {deleteFolder.isPending ? "Deleting..." : "Delete Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
