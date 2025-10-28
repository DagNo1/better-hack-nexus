"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetProjectById, useDeleteProject } from "@/hooks/project";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { ProjectFormDialog, ConfirmationDialog } from "@/components/dialogs";
import { ProjectMembersTable } from "@/layouts/tables/project-members-table";
import { FoldersTable } from "@/layouts/tables/folders-table";
import type { ProjectFormData } from "@/types/project";
import { useUpdateProject } from "@/hooks/project";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@daveyplate/better-auth-ui";

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
      <div className="min-h-screen bg-transparent w-5xl relative">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="w-full mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-transparent w-5xl relative">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Project Not Found</h1>
          </div>
        </header>
        <main className="w-full mx-auto px-4 py-8">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent w-5xl relative">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SignedIn>
              {/* <UserButton className="bg-background text-white hover:bg-primary/10" /> */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Created {format(new Date(project.createdAt), "PPP")} • Updated{" "}
                  {format(new Date(project.updatedAt), "PPP")}
                </p>
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </div>
          <SignedIn>
            <ProjectActionButtons
              projectId={projectId}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          </SignedIn>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-8">
        <SignedIn>
          <div className="flex flex-col gap-8">
            <ProjectMembersTable projectId={projectId} />
            <FoldersTable projectId={projectId} />
          </div>
        </SignedIn>
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

interface ProjectActionButtonsProps {
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectActionButtons({
  projectId,
  onEdit,
  onDelete,
}: ProjectActionButtonsProps) {
  const [canManage, setCanManage] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const checks = {
        manage: {
          resourceType: "project",
          resourceId: projectId,
          action: "manage",
        },
        delete: {
          resourceType: "project",
          resourceId: projectId,
          action: "delete",
        },
      };

      // Single batch API call
      await authClient.zanzibar.hasPermissions(
        { checks },
        {
          onSuccess: (data) => {
            const permissions = data.data ?? {};
            setCanManage(permissions.manage?.allowed ?? false);
            setCanDelete(permissions.delete?.allowed ?? false);
          },
          onError: (error) => {
            console.error("Failed to check permissions:", error);
          },
        }
      );
    };

    checkPermissions();
  }, [projectId]);

  return (
    <div className="flex gap-2">
      {canManage && (
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
      {canDelete && (
        <Button variant="destructive" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </div>
  );
}
