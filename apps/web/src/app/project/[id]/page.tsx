"use client";

import { format } from "date-fns";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks
import {
  useDeleteProject,
  useGetProjectById,
  useUpdateProject,
} from "@/hooks/project";

// Components
import { ConfirmationDialog, ProjectFormDialog } from "@/components/dialogs";
import {
  ActionButtons,
  AuthWrapper,
  LoadingState,
  NotFoundState,
  PageHeader,
  PageLayout,
} from "@/components/layout";
import { FoldersTable } from "@/layouts/tables/folder-table";
import { ProjectMembersTable } from "@/layouts/tables/project-members-table";

// Types
import type { ProjectFormData } from "@/types/api";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";

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
    return (
      <LoadingState header={<Skeleton className="h-8 w-48" />} sections={2} />
    );
  }

  if (!project) {
    return (
      <NotFoundState
        header={<h1 className="text-2xl font-bold">Project Not Found</h1>}
        description="The project you're looking for doesn't exist or you don't have permission to view it."
        action={{
          label: "Back to Projects",
          onClick: () => router.push("/"),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
        }}
      />
    );
  }

  return (
    <PageLayout>
      <AuthWrapper userButtonClassName="bg-background text-white hover:bg-primary/10">
        <PageHeader
          title={project.name}
          subtitle={`Created ${format(new Date(project.createdAt), "PPP")} • Updated ${format(new Date(project.updatedAt), "PPP")}`}
          onBack={() => router.push("/")}
          actions={
            <ActionButtons
              actions={[
                {
                  key: "edit",
                  label: "Edit",
                  icon: <Edit className="h-4 w-4 mr-2" />,
                  variant: "outline",
                  onClick: handleEditProject,
                  permission: {
                    resourceType: "project",
                    resourceId: projectId,
                    action: "manage",
                  },
                },
                {
                  key: "delete",
                  label: "Delete",
                  icon: <Trash className="h-4 w-4 mr-2" />,
                  variant: "destructive",
                  onClick: handleDeleteProject,
                  permission: {
                    resourceType: "project",
                    resourceId: projectId,
                    action: "delete",
                  },
                },
              ]}
            />
          }
        />
      </AuthWrapper>

      <div className="flex flex-col gap-8">
        <ProjectMembersTable projectId={projectId} />
        <FoldersTable projectId={projectId} />
      </div>

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
    </PageLayout>
  );
}
