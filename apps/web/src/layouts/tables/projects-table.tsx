"use client";

import {
  useCreateProject,
  useGetProjects,
  useUpdateProject,
} from "@/hooks/project";
import type { Project, ProjectFormData } from "@/types/project";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { format } from "date-fns";
import { Edit, ExternalLink, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog, ProjectFormDialog } from "@/components/dialogs";
import { useDeleteProject } from "@/hooks/project";

export function ProjectsTable() {
  const { data: projects, isLoading } = useGetProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const handleCreateProject = () => {
    setFormMode("create");
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setFormMode("edit");
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    if (project) {
      setDeletingProject(project);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    try {
      await deleteProject.mutateAsync({ id: deletingProject.id });
      setDeletingProject(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      if (formMode === "create") {
        await createProject.mutateAsync({ name: data.name } as any);
      } else if (formMode === "edit" && editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          name: data.name,
        });
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

  const handleViewProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const isEmpty = !projects || projects.length === 0;

  return (
    <div className="space-y-6">
      <ProjectsHeader onCreateProject={handleCreateProject} />

      {isEmpty && !isLoading ? (
        <EmptyProjectsState />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <ProjectsTableHeader />
            <TableBody>
              {isLoading ? (
                <LoadingTableRows />
              ) : (
                (projects || []).map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onView={handleViewProject}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectFormDialog
        mode={formMode}
        project={editingProject}
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleFormSubmit}
        isLoading={createProject.isPending || updateProject.isPending}
      />

      <ConfirmationDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}

function ProjectsHeader({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Projects</h2>
      <Button onClick={onCreateProject}>
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </Button>
    </div>
  );
}

function EmptyProjectsState() {
  return (
    <Card className="w-full flex flex-col items-center justify-center p-12 text-center">
      <CardHeader className="w-full">
        <CardTitle>No Projects Yet</CardTitle>
        <CardDescription>
          Get started by creating your first project
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ProjectsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[300px]">Name</TableHead>
        <TableHead>Created</TableHead>
        <TableHead>Updated</TableHead>
        <TableHead className="w-[100px]">Folders</TableHead>
        <TableHead className="w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function LoadingTableRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[40px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface ProjectRowProps {
  project: Project;
  onView: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

function ProjectRow({ project, onView, onEdit, onDelete }: ProjectRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onView(project.id)}
    >
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell>{format(new Date(project.createdAt), "MM/dd/yyyy")}</TableCell>
      <TableCell>{format(new Date(project.updatedAt), "MM/dd/yyyy")}</TableCell>
      <TableCell>{project.folders?.length || 0}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onView(project.id);
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
