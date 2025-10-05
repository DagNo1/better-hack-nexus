"use client";

import {
  useCreateFolder,
  useDeleteFolder,
  useGetFoldersByProject,
  useUpdateFolder,
  useAddUserToFolder,
  useRemoveUserFromFolder,
  useGetFolderUsers,
} from "@/hooks/folder";
import {
  useAddUserToProject,
  useRemoveUserFromProject,
  useGetProjectUsers,
} from "@/hooks/project";
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
import { 
  UserManagementDialog,
  DeleteFolderDialog,
  EditFolderDialog,
} from "@/components/dialogs";

// Form validation schema for inline folder creation
const folderFormSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be 100 characters or less")
    .trim()
    .refine((val) => val.length > 0, "Folder name cannot be empty"),
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
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedFolderForUsers, setSelectedFolderForUsers] = useState<
    string | null
  >(null);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const { data: folders, isLoading: foldersLoading } = useGetFoldersByProject(
    project?.id || ""
  );

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  // User management hooks
  const addUserToProject = useAddUserToProject();
  const removeUserFromProject = useRemoveUserFromProject();
  const { data: projectUsers = [] } = useGetProjectUsers(project?.id || "");

  const addUserToFolder = useAddUserToFolder();
  const removeUserFromFolder = useRemoveUserFromFolder();
  const { data: folderUsers = [] } = useGetFolderUsers(
    selectedFolderForUsers || ""
  );

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
    // Reset folder form state
    folderForm.reset();
    setShowInlineFolderInput(false);
    onOpenChange(false);
  };

  // Inline folder handlers
  const handleAddFolder = () => {
    setShowInlineFolderInput(true);
  };

  const handleInlineFolderSubmit = async (data: FolderFormData) => {
    if (!project?.id) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    try {
      const created = await createFolder.mutateAsync({
        name: data.name,
        projectId: project.id,
      });
      folderForm.reset();
      setShowInlineFolderInput(false);
      toast.success(`Folder "${data.name}" created successfully!`);
      // After create, open user management for the new folder
      if (created?.id) {
        setSelectedFolderForUsers(created.id);
        setShowUserManagement(true);
      }
    } catch (error: any) {
      console.error("Failed to create folder:", error);

      // Handle specific error types
      if (error?.data?.code === "CONFLICT") {
        toast.error("A folder with this name already exists in this project.");
        folderForm.setError("name", {
          message: "A folder with this name already exists",
        });
      } else if (error?.data?.code === "NOT_FOUND") {
        toast.error("Project not found. Please refresh and try again.");
      } else if (error?.data?.code === "BAD_REQUEST") {
        toast.error("Invalid folder name. Please check your input.");
        folderForm.setError("name", {
          message: error.message || "Invalid folder name",
        });
      } else {
        toast.error(
          error?.message || "Failed to create folder. Please try again."
        );
      }
    }
  };

  const handleEditFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowEditFolderDialog(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders?.find((f) => f.id === folderId);
    if (folder) {
      setSelectedFolder(folder);
      setShowDeleteFolderDialog(true);
    }
  };

  const handleAddUser = (folderId: string) => {
    setSelectedFolderForUsers(folderId);
    setShowUserManagement(true);
  };

  const handleProjectUserManagement = () => {
    setSelectedFolderForUsers(null);
    setShowUserManagement(true);
  };

  const handleAddUserToProject = async (userId: string, role: string) => {
    if (!project?.id) return;
    await addUserToProject.mutateAsync({
      projectId: project.id,
      userId,
      role,
    });
  };

  const handleRemoveUserFromProject = async (userId: string) => {
    if (!project?.id) return;
    await removeUserFromProject.mutateAsync({
      projectId: project.id,
      userId,
    });
  };

  const handleAddUserToFolder = async (userId: string, role: string) => {
    if (!selectedFolderForUsers) return;
    await addUserToFolder.mutateAsync({
      folderId: selectedFolderForUsers,
      userId,
      role,
    });
  };

  const handleRemoveUserFromFolder = async (userId: string) => {
    if (!selectedFolderForUsers) return;
    await removeUserFromFolder.mutateAsync({
      folderId: selectedFolderForUsers,
      userId,
    });
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
            <div className="flex items-center justify-between mb-2">
              <Label
                htmlFor="project-name"
                className="block text-sm font-medium"
              >
                Name
              </Label>
              {mode === "edit" && project && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleProjectUserManagement}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Manage Users
                </Button>
              )}
            </div>
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
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-2"
                  >
                    <Input
                      placeholder="Enter folder name"
                      disabled={createFolder.isPending}
                      {...folderForm.register("name")}
                      className="w-full"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          folderForm.handleSubmit(handleInlineFolderSubmit)();
                        }
                      }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          folderForm.handleSubmit(handleInlineFolderSubmit)();
                        }}
                      >
                        {createFolder.isPending ? "Creating..." : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
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

        {/* User Management Dialog */}
          <UserManagementDialog
          open={showUserManagement}
          onOpenChange={setShowUserManagement}
          title={
            selectedFolderForUsers
              ? "Manage Folder Users"
              : "Manage Project Users"
          }
          description={
            selectedFolderForUsers
              ? "Add or remove users from this folder"
              : "Add or remove users from this project"
          }
          users={selectedFolderForUsers ? folderUsers : projectUsers}
            resourceType={selectedFolderForUsers ? "folder" : "project"}
          onAddUser={
            selectedFolderForUsers
              ? handleAddUserToFolder
              : handleAddUserToProject
          }
          onRemoveUser={
            selectedFolderForUsers
              ? handleRemoveUserFromFolder
              : handleRemoveUserFromProject
          }
          isLoading={
            addUserToProject.isPending ||
            removeUserFromProject.isPending ||
            addUserToFolder.isPending ||
            removeUserFromFolder.isPending
          }
        />

        {/* Delete Folder Dialog */}
        <DeleteFolderDialog
          folder={selectedFolder}
          open={showDeleteFolderDialog}
          onOpenChange={setShowDeleteFolderDialog}
        />

        {/* Edit Folder Dialog */}
        <EditFolderDialog
          folder={selectedFolder}
          open={showEditFolderDialog}
          onOpenChange={setShowEditFolderDialog}
        />
      </div>
    </div>
  );
}
