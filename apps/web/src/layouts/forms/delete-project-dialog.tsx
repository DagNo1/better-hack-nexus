"use client";

import { useDeleteProject } from "@/hooks/project";
import { Button } from "@workspace/ui/components/button";
import { AlertTriangle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

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
          onOpenChange(false);
        },
      }
    );
  };

  if (!project || !open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-bold">Delete Project</h2>
        </div>
        <p className="mb-4">
          Are you sure you want to delete the project "{project.name}"? This
          action cannot be undone.
        </p>
        <div className="bg-muted p-3 rounded-md mb-4">
          <p className="text-sm font-medium">{project.name}</p>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
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
        </div>
      </div>
    </div>
  );
}
