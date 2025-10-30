"use client";

import BackButton from "@/components/buttons/back-button";
import { ConfirmationDialog, FolderFormDialog } from "@/components/dialogs";
import {
  useDeleteFolder,
  useGetFolderById,
  useUpdateFolder,
} from "@/hooks/folder";
import { useGetProjectById } from "@/hooks/project";
import { FilesTable } from "@/layouts/tables/files-table";
import { SubfoldersTable } from "@/layouts/tables/subfolders-table";
import { Button } from "@workspace/ui/components/button";
import { format } from "date-fns";
import { ChevronRight, Edit, FolderIcon, Loader2, Trash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const { data: folder, isLoading } = useGetFolderById(folderId);
  const { data: project } = useGetProjectById(folder?.projectId || "");
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Build breadcrumb path
  const buildBreadcrumbs = () => {
    const breadcrumbs: { name: string; href: string }[] = [];

    if (project) {
      breadcrumbs.push({
        name: project.name,
        href: `/project/${project.id}`,
      });
    }

    // For now, just show current folder
    // In a real implementation, you'd fetch the full parent chain
    if (folder?.parentId) {
      breadcrumbs.push({
        name: "...",
        href: `/folder/${folder.parentId}`,
      });
    }

    return breadcrumbs;
  };

  const handleEditFolder = () => {
    setShowEditForm(true);
  };

  const handleDeleteFolder = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFolder.mutateAsync({ id: folderId });
      // Navigate back to project or parent folder
      if (folder?.projectId) {
        router.push(`/project/${folder.projectId}`);
      } else if (folder?.parentId) {
        router.push(`/folder/${folder.parentId}`);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const handleFormSubmit = async (data: { name: string }) => {
    try {
      await updateFolder.mutateAsync({
        id: folderId,
        name: data.name,
      });
      setShowEditForm(false);
      toast.success("Folder updated successfully");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to update folder. Please try again.");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!folder)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Folder Not Found</h1>
        <p className="text-muted-foreground">
          The folder doesn't exist or you lack permission to view it.
        </p>
      </div>
    );

  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="min-h-screen bg-transparent w-5xl relative">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm mb-3">
            <BackButton />
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{folder.name}</span>
            </div>
          </div>

          {/* Title and Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{folder.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(folder.createdAt), "PPP")} &bull;
                Updated {format(new Date(folder.updatedAt), "PPP")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEditFolder}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteFolder}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-8 flex flex-col gap-8">
        <SubfoldersTable folderId={folderId} />
        <FilesTable folderId={folderId} />
      </main>

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
        description={`Are you sure you want to delete "${folder?.name}"? This action cannot be undone and will remove all subfolders and files.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteFolder.isPending}
      />
    </div>
  );
}
