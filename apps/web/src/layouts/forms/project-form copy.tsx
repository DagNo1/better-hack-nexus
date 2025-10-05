"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import type { Project, ProjectFormData } from "@/types/project";
import { toast } from "sonner";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectForm({
  mode,
  project,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ProjectFormProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (mode === "edit" && project) {
      setName(project.name);
    } else if (mode === "create") {
      setName("");
    }
  }, [mode, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    try {
      await onSubmit({ name: name.trim() });
      toast.success(
        mode === "create"
          ? "Project created successfully!"
          : "Project updated successfully!"
      );
      setName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        mode === "create"
          ? "Failed to create project. Please try again."
          : "Failed to update project. Please try again."
      );
    }
  };

  const handleCancel = () => {
    if (mode === "edit" && project) {
      setName(project.name);
    } else {
      setName("");
    }
    onOpenChange(false);
  };

  if (!open) return null;

  const isFormValid = name.trim().length > 0;
  const hasChanges = mode === "edit" ? name !== (project?.name || "") : true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 border border-border">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </h2>

          <div className="mb-4">
            <Label htmlFor="project-name" className="block text-sm font-medium mb-2">
              Name
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || !hasChanges || isLoading}
              className="min-w-[100px]"
            >
              {isLoading
                ? (mode === "create" ? "Creating..." : "Updating...")
                : (mode === "create" ? "Create Project" : "Update Project")
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
