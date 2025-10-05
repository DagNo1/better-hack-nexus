"use client";

import { useDeleteProject } from "@/hooks/project";
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
import type { Project } from "@/types/project";
import { toast } from "sonner";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    if (!project) return;

    deleteProject.mutate(
      { id: project.id },
      {
        onSuccess: () => {
          toast.success("Project deleted successfully!");
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Delete project error:", error);
          toast.error("Failed to delete project. Please try again.");
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
            <DialogTitle>Delete Project</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete the project "{project?.name}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {project && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">{project.name}</p>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(project.createdAt).toLocaleDateString()}
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
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
