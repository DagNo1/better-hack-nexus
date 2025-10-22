import { ConfirmationDialog, ProjectFormDialog } from "@/components/dialogs";
import { columns } from "@/components/table/columns/project-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import {
  useCreateProject,
  useDeleteProject,
  useGetProjects,
  useUpdateProject,
} from "@/hooks/project";
import type { Project, ProjectFormData } from "@/types/project";
import { Edit, ExternalLink, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
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

  const handleViewProject = (project: Project) => {
    router.push(`/project/${project.id}`);
  };

  const actions: TableAction<Project>[] = [
    {
      key: "view",
      label: "View Details",
      icon: ExternalLink,
      onClick: handleViewProject,
      permission: {
        resourceType: "project",
        resourceId: (project) => project.id,
        action: "manage",
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: Edit,
      onClick: handleEditProject,
      permission: {
        resourceType: "project",
        resourceId: (project) => project.id,
        action: "edit",
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: Trash,
      variant: "destructive",
      onClick: handleDeleteProject,
      permission: {
        resourceType: "project",
        resourceId: (project) => project.id,
        action: "delete",
      },
    },
  ];

  return (
    <DataTable
      data={projects}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      title="Projects"
      createButton={{
        label: "New Project",
        onClick: handleCreateProject,
      }}
      emptyState={{
        title: "No Projects Yet",
        description: "Get started by creating your first project",
      }}
      getRowKey={(project) => project.id}
      onRowClick={handleViewProject}
    >
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
    </DataTable>
  );
}
