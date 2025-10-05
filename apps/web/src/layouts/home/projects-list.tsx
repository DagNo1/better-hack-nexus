"use client";

import {
  useCreateProject,
  useGetProjects,
  useUpdateProject,
} from "@/hooks/project";
import { useCreateFolder } from "@/hooks/folder";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Input } from "@workspace/ui/components/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProjectCard } from "../../components/cards/project-card";
import { DeleteProjectDialog } from "../forms/delete-project-dialog";
import { ProjectForm } from "../forms/project-form";
import type {
  Project,
  ProjectFormData,
  CreateFolderInput,
} from "@/types/project";
import { toast } from "sonner";

// Form validation schema for inline folder creation
const folderFormSchema = z.object({
  name: z.string().min(1, "Folder name is required").trim(),
});

type FolderFormData = z.infer<typeof folderFormSchema>;

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
  const { data: projects, isLoading, error } = useGetProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const createFolder = useCreateFolder();

  const [showForm, setShowForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showInlineFolderInput, setShowInlineFolderInput] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Inline folder creation form
  const folderForm = useForm<FolderFormData>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCreateProject = () => {
    setFormMode("create");
    setCurrentProject(null);
    setShowForm(true);
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
        const newProject = await createProject.mutateAsync(data);
        // Create an initial folder for the new project
        await createFolder.mutateAsync({
          name: "Getting Started",
          projectId: newProject.id,
        });
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

  const handleAddFolder = () => {
    setShowInlineFolderInput(true);
  };

  const handleInlineFolderSubmit = async (data: FolderFormData) => {
    if (!currentProject?.id) return;

    try {
      await createFolder.mutateAsync({
        name: data.name,
        projectId: currentProject.id,
      });
      folderForm.reset();
      setShowInlineFolderInput(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">
                Error loading projects
              </CardTitle>
              <CardDescription>
                There was a problem loading your projects. Please try again
                later.
              </CardDescription>
            </CardHeader>
          </Card>
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
          {showInlineFolderInput && currentProject ? (
            <div className="flex gap-2">
              <form onSubmit={folderForm.handleSubmit(handleInlineFolderSubmit)} className="flex gap-2">
                <Input
                  placeholder="Enter folder name"
                  disabled={createFolder.isPending}
                  {...folderForm.register("name")}
                  className="w-48"
                />
                {folderForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {folderForm.formState.errors.name.message}
                  </p>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={createFolder.isPending}
                >
                  {createFolder.isPending ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowInlineFolderInput(false);
                    folderForm.reset();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <Button
              onClick={handleAddFolder}
              variant="outline"
              disabled={!currentProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
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
    </div>
  );
}
