"use client";

import { useDeleteUser } from "@/hooks/user";
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
import type { User } from "@/types/project";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;

    deleteUser.mutate(
      { id: user.id },
      {
        onSuccess: () => {
          toast.success("User deleted successfully!");
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Delete User error:", error);
          toast.error("Failed to delete user. Please try again.");
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
            <DialogTitle>Delete User</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete the user "{user?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(user.createdAt).toLocaleDateString()}
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
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
