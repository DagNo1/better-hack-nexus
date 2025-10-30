import { ConfirmationDialog, FileFormDialog } from "@/components/dialogs";
import { columns, type File } from "@/components/table/columns/file-column";
import { DataTable } from "@/components/table/data-table";
import { useDeleteFile, useGetFilesByFolder } from "@/hooks/file";
import { authClient } from "@/lib/auth-client";
import { Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface FilesTableProps {
  folderId: string;
}

export function FilesTable({ folderId }: FilesTableProps) {
  const { data: files, isLoading } = useGetFilesByFolder(folderId);
  const deleteFile = useDeleteFile();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [deletingFile, setDeletingFile] = useState<File | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});

  // Batch check all permissions
  useEffect(() => {
    const checkAllPermissions = async () => {
      if (!files) return;

      const checks: Record<string, any> = {};

      // Create permission (based on folder)
      checks["create-file"] = {
        resourceType: "folder",
        action: "edit",
        resourceId: folderId,
      };

      // Per-file permissions
      files.forEach((file) => {
        checks[`${file.id}-edit`] = {
          resourceType: "file",
          resourceId: file.id,
          action: "edit",
        };
        checks[`${file.id}-delete`] = {
          resourceType: "file",
          resourceId: file.id,
          action: "delete",
        };
      });

      // Single batch API call
      await authClient.zanzibar.hasPermissions(
        { checks },
        {
          onSuccess: (data) => {
            setPermissions(data.data ?? {});
          },
          onError: (error) => {
            console.error("Failed to check permissions:", error);
          },
        }
      );
    };

    checkAllPermissions();
  }, [files, folderId]);

  const handleCreateFile = () => {
    setFormMode("create");
    setEditingFile(null);
    setShowForm(true);
  };

  const handleEditFile = (file: File) => {
    setFormMode("edit");
    setEditingFile(file);
    setShowForm(true);
  };

  const handleDeleteFile = (file: File) => {
    setDeletingFile(file);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    try {
      await deleteFile.mutateAsync({ id: deletingFile.id });
      setDeletingFile(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  return (
    <DataTable
      data={files}
      isLoading={isLoading}
      columns={columns}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Edit,
          onClick: handleEditFile,
          condition: (file) => permissions[`${file.id}-edit`]?.allowed ?? false,
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash,
          variant: "destructive",
          onClick: handleDeleteFile,
          condition: (file) =>
            permissions[`${file.id}-delete`]?.allowed ?? false,
        },
      ]}
      title="Files"
      createButton={{
        label: "New File",
        onClick: handleCreateFile,
        show: permissions["create-file"]?.allowed ?? false,
      }}
      emptyState={{
        title: "No Files Yet",
        description: "Get started by creating your first file",
      }}
      getRowKey={(file) => file.id}
    >
      <FileFormDialog
        mode={formMode}
        file={editingFile}
        folderId={folderId}
        open={showForm}
        onOpenChange={setShowForm}
      />

      <ConfirmationDialog
        open={!!deletingFile}
        onOpenChange={(open) => !open && setDeletingFile(null)}
        onConfirm={handleConfirmDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${deletingFile?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteFile.isPending}
      />
    </DataTable>
  );
}
