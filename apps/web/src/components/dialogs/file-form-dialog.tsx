"use client";

import { useCreateFile, useUpdateFile } from "@/hooks/file";
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
import type { File } from "@/types/api";

// Form validation schema
const documentFormSchema = z.object({
  name: z
    .string()
    .min(1, "Document name is required")
    .max(100, "Document name must be 100 characters or less")
    .trim(),
  content: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

interface DocumentFormDialogProps {
  mode: "create" | "edit";
  document?: File | null;
  folderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentFormDialog({
  mode,
  document,
  folderId,
  open,
  onOpenChange,
}: DocumentFormDialogProps) {
  const createFile = useCreateFile();
  const updateFile = useUpdateFile();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && document) {
      form.setValue("name", document.name);
      form.setValue("content", document.content || "");
    } else if (mode === "create") {
      form.reset();
    }
  }, [mode, document, open, form]);

  const handleSubmit = async (data: DocumentFormData) => {
    try {
      if (mode === "create") {
        if (!folderId) {
          throw new Error("Folder ID is required for creating documents");
        }
        await createFile.mutateAsync({
          name: data.name,
          content: data.content,
          folderId,
        });
      } else if (mode === "edit" && document) {
        await updateFile.mutateAsync({
          id: document.id,
          name: data.name,
          content: data.content,
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

  const isLoading = createFile.isPending || updateFile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New File" : "Edit File"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new file to this folder."
              : "Update the file name and content."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name</Label>
            <Input
              id="document-name"
              placeholder="Enter document name"
              {...form.register("name")}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-content">Content</Label>
            <textarea
              id="file-content"
              placeholder="Enter file content (optional)"
              rows={10}
              {...form.register("content")}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
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
                  ? "Create File"
                  : "Update File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
