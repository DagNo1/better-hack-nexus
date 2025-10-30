"use client";

import { format } from "date-fns";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Hooks
import {
  useDeleteFolder,
  useGetFolderById
} from "@/hooks/folder";

// Components
import { ConfirmationDialog, FolderFormDialog } from "@/components/dialogs";
import {
  ActionButtons,
  AuthWrapper,
  LoadingState,
  NotFoundState,
  PageHeader,
  PageLayout,
} from "@/components/layout";
import { DocumentsTable } from "@/layouts/tables/document-table";
import { FolderMembersTable } from "@/layouts/tables/folder-member-table";

// Types
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const { data: folder, isLoading } = useGetFolderById(folderId);
  const deleteFolder = useDeleteFolder();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const projectId = folder?.projectId;

  const handleEditFolder = () => {
    setShowEditForm(true);
  };

  const handleDeleteFolder = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFolder.mutateAsync({ id: folderId });
      router.push(`/project/${projectId}`);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  if (isLoading) {
    return (
      <LoadingState header={<Skeleton className="h-8 w-48" />} sections={2} />
    );
  }

  if (!folder) {
    return (
      <NotFoundState
        header={<h1 className="text-2xl font-bold">Folder Not Found</h1>}
        description="The folder you're looking for doesn't exist or you don't have permission to view it."
        action={{
          label: "Back to Project",
          onClick: () => router.push(`/project/${projectId}`),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
        }}
      />
    );
  }

  return (
    <PageLayout>
      <AuthWrapper userButtonClassName="bg-background text-white hover:bg-primary/10">
        <PageHeader
          title={folder.name}
          subtitle={`Created ${format(new Date(folder.createdAt), "PPP")} • Updated ${format(new Date(folder.updatedAt), "PPP")}`}
          onBack={() => router.push(`/project/${projectId}`)}
          actions={
            <ActionButtons
              actions={[
                {
                  key: "edit",
                  label: "Edit",
                  icon: <Edit className="h-4 w-4 mr-2" />,
                  variant: "outline",
                  onClick: handleEditFolder,
                  permission: {
                    resourceType: "folder",
                    resourceId: folderId,
                    action: "manage",
                  },
                },
                {
                  key: "delete",
                  label: "Delete",
                  icon: <Trash className="h-4 w-4 mr-2" />,
                  variant: "destructive",
                  onClick: handleDeleteFolder,
                  permission: {
                    resourceType: "folder",
                    resourceId: folderId,
                    action: "delete",
                  },
                },
              ]}
            />
          }
        />
      </AuthWrapper>

      <div className="flex flex-col gap-8">
        <FolderMembersTable folderId={folderId} />
        <DocumentsTable folderId={folderId} />
      </div>

      {/* Edit Folder Form */}
      <FolderFormDialog
        mode="edit"
        folder={folder}
        open={showEditForm}
        onOpenChange={setShowEditForm}
      />

      {/* Delete Folder Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folder?.name}"? This action cannot be undone and will remove all documents and members.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteFolder.isPending}
      />
    </PageLayout>
  );
}
