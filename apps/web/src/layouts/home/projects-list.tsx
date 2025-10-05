"use client";

import { UserManagementDialog } from "@/components/dialogs/user-management-dialog";
import {
  useAddUserToProject,
  useCreateProject,
  useGetProjects,
  useGetProjectUsers,
  useRemoveUserFromProject,
  useUpdateProject,
} from "@/hooks/project";
import type { Project, ProjectFormData } from "@/types/project";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectCard } from "../../components/cards/project-card";
import { DeleteProjectDialog } from "../forms/delete-project-dialog";
import { ProjectForm } from "../forms/project-form";

// Loading skeleton for project cards
function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyProjectsState({
  onCreateProject,
}: {
  onCreateProject: () => void;
}) {
  return (
    <div className="text-center py-12">
      <Card className="max-w-md mx-auto border-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl">No projects yet</CardTitle>
          <CardDescription>
            Get started by creating your first project to organize your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCreateProject} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProjectsList() {
  const { data: projects, isLoading } = useGetProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedProjectForUsers, setSelectedProjectForUsers] =
    useState<Project | null>(null);

  // User management hooks
  const addUserToProject = useAddUserToProject();
  const removeUserFromProject = useRemoveUserFromProject();
  const { data: projectUsers = [] } = useGetProjectUsers(
    selectedProjectForUsers?.id || ""
  );

  const handleCreateProject = () => {
    setFormMode("create");
    setCurrentProject(null);
    setShowForm(true);
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
  };

  const handleEditProject = (project: Project) => {
    setFormMode("edit");
    setCurrentProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    if (project) {
      setDeletingProject(project);
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      if (formMode === "create") {
        await createProject.mutateAsync(data);
        toast.success("Project created successfully!");
      } else if (formMode === "edit" && currentProject) {
        await updateProject.mutateAsync({
          id: currentProject.id,
          name: data.name,
        });
        toast.success("Project updated successfully!");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        formMode === "create"
          ? "Failed to create project. Please try again."
          : "Failed to update project. Please try again."
      );
      throw error;
    }
  };
  const handleManageUsers = (project: Project) => {
    setSelectedProjectForUsers(project);
    setShowUserManagement(true);
  };

  const handleAddUserToProject = async (userId: string) => {
    if (!selectedProjectForUsers?.id) return;
    await addUserToProject.mutateAsync({
      projectId: selectedProjectForUsers.id,
      userId,
    });
  };

  const handleRemoveUserFromProject = async (userId: string) => {
    if (!selectedProjectForUsers?.id) return;
    await removeUserFromProject.mutateAsync({
      projectId: selectedProjectForUsers.id,
      userId,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        <EmptyProjectsState onCreateProject={handleCreateProject} />

        <ProjectForm
          mode={formMode}
          project={currentProject}
          open={showForm}
          onOpenChange={setShowForm}
          onSubmit={handleFormSubmit}
          isLoading={createProject.isPending || updateProject.isPending}
        />
        <DeleteProjectDialog
          project={deletingProject}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="flex flex-row gap-2">
          {currentProject && (
            <div className="text-sm text-muted-foreground mr-2 flex items-center gap-2">
              <span>
                Selected:{" "}
                <span className="font-medium text-primary">
                  {currentProject.name}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentProject(null)}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onManageUsers={handleManageUsers}
            isSelected={currentProject?.id === project.id}
            onSelect={() => handleSelectProject(project)}
          />
        ))}
      </div>

      <ProjectForm
        mode={formMode}
        project={currentProject}
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleFormSubmit}
        isLoading={createProject.isPending || updateProject.isPending}
      />
      <DeleteProjectDialog
        project={deletingProject}
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      />

      <UserManagementDialog
        open={showUserManagement}
        onOpenChange={setShowUserManagement}
        title="Manage Project Users"
        description="Add or remove users from this project"
        users={projectUsers}
        onAddUser={handleAddUserToProject}
        onRemoveUser={handleRemoveUserFromProject}
        isLoading={
          addUserToProject.isPending || removeUserFromProject.isPending
        }
      />
    </div>
  );
}
