import { ConfirmationDialog, ProjectFormDialog } from "@/components/dialogs";
import { columns } from "@/components/table/columns/project-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import {
  useCreateProject,
  useDeleteProject,
  useGetProjects,
  useUpdateProject,
} from "@/hooks/project";
import { authClient } from "@/lib/auth-client";
import type { Project, ProjectFormData } from "@/types/project";
import { Edit, ExternalLink, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [permissions, setPermissions] = useState<Record<string, any>>({});

  // Batch check all permissions
  useEffect(() => {
    const checkAllPermissions = async () => {
      if (!projects || projects.length === 0) return;

      const checks: Record<string, any> = {};

      // Create permission
      checks["create-project"] = {
        resourceType: "project",
        action: "create",
        resourceId: "",
      };

      // Per-project permissions
      projects.forEach((project) => {
        checks[`${project.id}-manage`] = {
          resourceType: "project",
          resourceId: project.id,
          action: "manage",
        };
        checks[`${project.id}-edit`] = {
          resourceType: "project",
          resourceId: project.id,
          action: "edit",
        };
        checks[`${project.id}-delete`] = {
          resourceType: "project",
          resourceId: project.id,
          action: "delete",
        };
      });

      // Single batch API call
      const result = await authClient.zanzibar.hasNamedPermissions({ checks });

      if (
        result.data &&
        typeof result.data === "object" &&
        !("error" in result.data)
      ) {
        setPermissions(result.data);
      }
    };

    checkAllPermissions();
  }, [projects]);

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
      condition: (project) =>
        permissions[`${project.id}-manage`]?.allowed ?? false,
    },
    {
      key: "edit",
      label: "Edit",
      icon: Edit,
      onClick: handleEditProject,
      condition: (project) =>
        permissions[`${project.id}-edit`]?.allowed ?? false,
    },
    {
      key: "delete",
      label: "Delete",
      icon: Trash,
      variant: "destructive",
      onClick: handleDeleteProject,
      condition: (project) =>
        permissions[`${project.id}-delete`]?.allowed ?? false,
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
        show: permissions["create-project"]?.allowed ?? false,
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
