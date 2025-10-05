"use client";

import {
  useCreateFolder,
  useDeleteFolder,
  useGetFoldersByProject,
  useUpdateFolder,
} from "@/hooks/folder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Project, ProjectFormData, Folder } from "@/types/project";
import { FolderItem } from "./folder-item";

// Form validation schema for inline folder creation
const folderFormSchema = z.object({
  name: z.string().min(1, "Folder name is required").trim(),
});

type FolderFormData = z.infer<typeof folderFormSchema>;
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
  const [showInlineFolderInput, setShowInlineFolderInput] = useState(false);

  const { data: folders, isLoading: foldersLoading } = useGetFoldersByProject(
    project?.id || ""
  );

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  // Inline folder creation form
  const folderForm = useForm<FolderFormData>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
    },
  });

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

  // Inline folder handlers
  const handleAddFolder = () => {
    setShowInlineFolderInput(true);
  };

  const handleInlineFolderSubmit = async (data: FolderFormData) => {
    if (!project?.id) return;

    try {
      await createFolder.mutateAsync({
        name: data.name,
        projectId: project.id,
      });
      folderForm.reset();
      setShowInlineFolderInput(false);
      toast.success(`Folder "${data.name}" created successfully!`);
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create folder. Please try again."
      );
    }
  };

  const handleEditFolder = (folder: Folder) => {
    // TODO: Implement inline folder editing
    toast.info("Inline folder editing will be implemented");
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm("Are you sure you want to delete this folder?")) {
      try {
        await deleteFolder.mutateAsync({ id: folderId });
      } catch (error) {
        console.error("Failed to delete folder:", error);
      }
    }
  };

  const handleAddUser = (folderId: string) => {
    // TODO: Implement add user functionality
    toast.info("Add user functionality will be implemented later");
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
            <Label
              htmlFor="project-name"
              className="block text-sm font-medium mb-2"
            >
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

          {mode === "edit" && foldersLoading && (
            <div className="mb-4">
              <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md border">
                Loading folders...
              </div>
            </div>
          )}

          {mode === "edit" && folders && folders.length > 0 && (
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-2">
                Project Folders ({folders.length})
              </Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/50 space-y-1">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    onEdit={handleEditFolder}
                    onDelete={handleDeleteFolder}
                    onAddUser={handleAddUser}
                  />
                ))}
              </div>
            </div>
          )}

          {mode === "edit" &&
            folders &&
            folders.length === 0 &&
            !foldersLoading && (
              <div className="mb-4">
                <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md border">
                  No folders created yet. Use "Add Folder" to create your first
                  folder.
                </div>
              </div>
            )}

          {mode === "edit" && (
            <div className="mb-4">
              {showInlineFolderInput ? (
                <div className="space-y-2">
                  <form
                    onSubmit={folderForm.handleSubmit(handleInlineFolderSubmit)}
                  >
                    <Input
                      placeholder="Enter folder name"
                      disabled={createFolder.isPending}
                      {...folderForm.register("name")}
                      className="w-full"
                    />
                    {folderForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {folderForm.formState.errors.name.message}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={createFolder.isPending}
                      >
                        {createFolder.isPending ? "Creating..." : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowInlineFolderInput(false);
                          folderForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddFolder}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Folder
                </Button>
              )}
            </div>
          )}

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
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Project"
                  : "Update Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
