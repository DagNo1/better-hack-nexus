"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Project, ProjectFormData } from "@/types/project";

// Form validation schema
const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less")
    .trim(),
});

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectFormDialog({
  mode,
  project,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && project) {
      form.setValue("name", project.name);
    } else if (mode === "create") {
      form.reset();
    }
  }, [mode, project, open, form]);

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
      // Error is handled by the parent component
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new project to organize your work."
              : "Update the project details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              {...form.register("name")}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <DialogFooter>
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
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Project"
                  : "Update Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
