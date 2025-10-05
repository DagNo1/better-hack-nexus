"use client";

import { useUpdateFolder } from "@/hooks/folder";
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
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Folder } from "@/types/project";
import { toast } from "sonner";

const folderFormSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be 100 characters or less")
    .trim(),
});

type FolderFormData = z.infer<typeof folderFormSchema>;

interface EditFolderDialogProps {
  folder: Folder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFolderDialog({
  folder,
  open,
  onOpenChange,
}: EditFolderDialogProps) {
  const updateFolder = useUpdateFolder();
  const [name, setName] = useState("");

  const folderForm = useForm<FolderFormData>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (folder && open) {
      setName(folder.name);
      folderForm.setValue("name", folder.name);
    }
  }, [folder, open, folderForm]);

  const handleSubmit = async (data: FolderFormData) => {
    if (!folder) return;

    try {
      await updateFolder.mutateAsync({
        id: folder.id,
        name: data.name,
      });
      toast.success("Folder updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update folder:", error);
      toast.error(
        error?.message || "Failed to update folder. Please try again."
      );
    }
  };

  const handleCancel = () => {
    if (folder) {
      setName(folder.name);
      folderForm.setValue("name", folder.name);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            <DialogTitle>Edit Folder</DialogTitle>
          </div>
          <DialogDescription>
            Update the folder name and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={folderForm.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name"
              {...folderForm.register("name")}
              disabled={updateFolder.isPending}
            />
            {folderForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {folderForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateFolder.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateFolder.isPending || !folderForm.formState.isValid}
            >
              {updateFolder.isPending ? "Updating..." : "Update Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
