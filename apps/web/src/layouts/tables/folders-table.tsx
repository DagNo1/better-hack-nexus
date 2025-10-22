import { ConfirmationDialog, FolderFormDialog } from "@/components/dialogs";
import { columns } from "@/components/table/columns/folder-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import { useDeleteFolder, useGetFoldersByProject } from "@/hooks/folder";
import type { Folder } from "@/types/project";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";

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

  const actions: TableAction<Folder>[] = [
    {
      key: "edit",
      label: "Edit",
      icon: Edit,
      onClick: handleEditFolder,
      permission: {
        resourceType: "folder",
        resourceId: (folder) => folder.id,
        action: "edit",
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: Trash,
      variant: "destructive",
      onClick: handleDeleteFolder,
      permission: {
        resourceType: "folder",
        resourceId: (folder) => folder.id,
        action: "delete",
      },
    },
  ];

  return (
    <DataTable
      data={folders}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      title="Folders"
      createButton={{
        label: "New Folder",
        onClick: handleCreateFolder,
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
