import { ConfirmationDialog, FolderFormDialog } from "@/components/dialogs";
import { columns } from "@/components/table/columns/folder-column";
import { DataTable } from "@/components/table/data-table";
import { useDeleteFolder, useGetFoldersByProject } from "@/hooks/folder";
import { authClient } from "@/lib/auth-client";
import type { Folder } from "@/types/project";
import { Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface FoldersTableProps {
  projectId: string;
}

export function FoldersTable({ projectId }: FoldersTableProps) {
  const { data: folders, isLoading } = useGetFoldersByProject(projectId);
  const deleteFolder = useDeleteFolder();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});

  // Batch check all permissions
  useEffect(() => {
    const checkAllPermissions = async () => {
      if (!folders) return;

      const checks: Record<string, any> = {};

      // Create permission (based on project)
      checks["create-folder"] = {
        resourceType: "project",
        action: "manage",
        resourceId: projectId,
      };

      // Per-folder permissions
      folders.forEach((folder) => {
        checks[`${folder.id}-edit`] = {
          resourceType: "folder",
          resourceId: folder.id,
          action: "edit",
        };
        checks[`${folder.id}-delete`] = {
          resourceType: "folder",
          resourceId: folder.id,
          action: "delete",
        };
      });

      // Single batch API call
      const result = await authClient.zanzibar.hasNamedPermissions({ checks });

      console.log("permissions", result);
      if (
        result.data &&
        typeof result.data === "object" &&
        !("error" in result.data)
      ) {
        setPermissions(result.data);
      }
    };

    checkAllPermissions();
  }, [folders, projectId]);

  const handleCreateFolder = () => {
    setFormMode("create");
    setEditingFolder(null);
    setShowForm(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setFormMode("edit");
    setEditingFolder(folder);
    setShowForm(true);
  };

  const handleDeleteFolder = (folder: Folder) => {
    setDeletingFolder(folder);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFolder) return;

    try {
      await deleteFolder.mutateAsync({ id: deletingFolder.id });
      setDeletingFolder(null);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  console.log(
    "permissions create-folder",
    permissions["create-folder"]?.allowed
  );

  return (
    <DataTable
      data={folders}
      isLoading={isLoading}
      columns={columns}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Edit,
          onClick: handleEditFolder,
          condition: (folder) =>
            permissions[`${folder.id}-edit`]?.allowed ?? false,
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash,
          variant: "destructive",
          onClick: handleDeleteFolder,
          condition: (folder) =>
            permissions[`${folder.id}-delete`]?.allowed ?? false,
        },
      ]}
      title="Folders"
      createButton={{
        label: "New Folder",
        onClick: handleCreateFolder,
        show: permissions["create-folder"]?.allowed ?? false,
      }}
      emptyState={{
        title: "No Folders Yet",
        description: "Get started by creating your first folder",
      }}
      getRowKey={(folder) => folder.id}
    >
      <FolderFormDialog
        mode={formMode}
        folder={editingFolder}
        projectId={projectId}
        open={showForm}
        onOpenChange={setShowForm}
      />

      <ConfirmationDialog
        open={!!deletingFolder}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Folder"
        description={`Are you sure you want to delete "${deletingFolder?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteFolder.isPending}
      />
    </DataTable>
  );
}
