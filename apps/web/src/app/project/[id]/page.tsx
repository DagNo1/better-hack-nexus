"use client";

import BackButton from "@/components/buttons/back-button";
import ProjectActionButtons from "@/components/buttons/project-actions";
import { ConfirmationDialog, ProjectFormDialog } from "@/components/dialogs";
import {
  useDeleteProject,
  useGetProjectById,
  useUpdateProject,
} from "@/hooks/project";
import { FoldersTable } from "@/layouts/tables/folders-table";
import { ProjectMembersTable } from "@/layouts/tables/project-members-table";
import type { ProjectFormData } from "@/types/project";
import { Button } from "@workspace/ui/components/button";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading } = useGetProjectById(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEditProject = () => {
    setShowEditForm(true);
  };

  const handleDeleteProject = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProject.mutateAsync({ id: projectId });
      router.push("/");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        name: data.name,
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to update project. Please try again.");
      throw error;
    }
  };

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (!project)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground">
          The project doesn't exist or you lack permission to view it.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent w-5xl relative">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(project.createdAt), "PPP")} &bull;
              Updated {format(new Date(project.updatedAt), "PPP")}
            </p>
          </div>
          <ProjectActionButtons
            projectId={projectId}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-8 flex flex-col gap-8">
        <ProjectMembersTable projectId={projectId} />
        <FoldersTable projectId={projectId} />
      </main>

      {/* Edit Project Form */}
      <ProjectFormDialog
        mode="edit"
        project={project}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={handleFormSubmit}
        isLoading={updateProject.isPending}
      />

      {/* Delete Project Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${project?.name}"? This action cannot be undone and will remove all folders and members.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}
