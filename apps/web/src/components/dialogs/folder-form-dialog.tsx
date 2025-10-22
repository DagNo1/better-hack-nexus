"use client";

import { useCreateFolder, useUpdateFolder } from "@/hooks/folder";
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
import type { Folder } from "@/types/project";

// Form validation schema
const folderFormSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be 100 characters or less")
    .trim(),
});

type FolderFormData = z.infer<typeof folderFormSchema>;

interface FolderFormDialogProps {
  mode: "create" | "edit";
  folder?: Folder | null;
  projectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FolderFormDialog({
  mode,
  folder,
  projectId,
  open,
  onOpenChange,
}: FolderFormDialogProps) {
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();

  const form = useForm<FolderFormData>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && folder) {
      form.setValue("name", folder.name);
    } else if (mode === "create") {
      form.reset();
    }
  }, [mode, folder, open, form]);

  const handleSubmit = async (data: FolderFormData) => {
    try {
      if (mode === "create") {
        if (!projectId) {
          throw new Error("Project ID is required for creating folders");
        }
        await createFolder.mutateAsync({
          name: data.name,
          projectId,
        });
      } else if (mode === "edit" && folder) {
        await updateFolder.mutateAsync({
          id: folder.id,
          name: data.name,
        });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
      // Error is handled by the mutation hooks
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const isLoading = createFolder.isPending || updateFolder.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Folder" : "Edit Folder"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new folder to this project."
              : "Update the folder name and settings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name"
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
                  ? "Create Folder"
                  : "Update Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
