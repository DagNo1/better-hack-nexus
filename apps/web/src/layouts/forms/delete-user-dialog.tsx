"use client";

import { useDeleteUser } from "@/hooks/user";
import { Button } from "@workspace/ui/components/button";
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

  if (!user || !open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-bold">Delete User</h2>
        </div>
        <p className="mb-4">
          Are you sure you want to delete the user "{user.name}"? This action
          cannot be undone.
        </p>
        <div className="bg-muted p-3 rounded-md mb-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
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
        </div>
      </div>
    </div>
  );
}
