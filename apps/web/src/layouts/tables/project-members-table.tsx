import {
  ConfirmationDialog,
  ProjectMemberFormDialog,
} from "@/components/dialogs";
import { columns } from "@/components/table/columns/project-member-column";
import { DataTable } from "@/components/table/data-table";
import {
  useGetProjectMembers,
  useRemoveMemberFromProject,
} from "@/hooks/project";
import { authClient } from "@/lib/auth-client";
import type { ProjectMember } from "@/types/project";
import { Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectMembersTableProps {
  projectId: string;
}

export function ProjectMembersTable({ projectId }: ProjectMembersTableProps) {
  const { data: members, isLoading } = useGetProjectMembers(projectId);
  const removeMember = useRemoveMemberFromProject();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(
    null
  );
  const [removingUser, setRemovingUser] = useState<ProjectMember | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});

  // Batch check all permissions
  useEffect(() => {
    const checkAllPermissions = async () => {
      const checks: Record<string, any> = {};

      // Manage members permission
      checks["manage-members"] = {
        resourceType: "project",
        action: "manage-members",
        resourceId: projectId,
      };
      // Single batch API call
      await authClient.zanzibar.hasPermissions(
        { checks },
        {
          onSuccess: (data) => {
            setPermissions(data.data ?? {});
          },
          onError: (error) => {
            console.error("Failed to check permissions:", error);
          },
        }
      );
    };

    checkAllPermissions();
  }, [projectId]);

  const handleAddMember = () => {
    setFormMode("add");
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: ProjectMember) => {
    setFormMode("edit");
    setEditingMember(member);
    setShowForm(true);
  };

  const handleRemoveMember = (user: ProjectMember) => {
    setRemovingUser(user);
  };

  const handleConfirmRemove = async () => {
    if (!removingUser) return;

    try {
      await removeMember.mutateAsync({
        projectId,
        userId: removingUser.id,
      });
      setRemovingUser(null);
    } catch (error) {
      console.error("Failed to remove member from project:", error);
    }
  };

  return (
    <DataTable
      data={members}
      isLoading={isLoading}
      columns={columns}
      actions={[
        {
          key: "edit",
          label: "Edit Role",
          icon: Edit,
          onClick: handleEditMember,
          condition: (member) =>
            member.role.toLowerCase() !== "owner" &&
            (permissions["manage-members"]?.allowed ?? false),
        },
        {
          key: "remove",
          label: "Remove from Project",
          icon: Trash,
          variant: "destructive",
          onClick: handleRemoveMember,
          condition: (member) =>
            member.role.toLowerCase() !== "owner" &&
            (permissions["manage-members"]?.allowed ?? false),
        },
      ]}
      title="Project Members"
      createButton={{
        label: "Add Member",
        onClick: handleAddMember,
        show: permissions["manage-members"]?.allowed ?? false,
      }}
      emptyState={{
        title: "No Members Yet",
        description: "Get started by adding members to this project",
      }}
      getRowKey={(member) => member.id}
    >
      <ProjectMemberFormDialog
        mode={formMode}
        projectId={projectId}
        member={editingMember}
        open={showForm}
        onOpenChange={setShowForm}
        existingMemberIds={(members || []).map((m) => m.id)}
      />

      <ConfirmationDialog
        open={!!removingUser}
        onOpenChange={(open) => !open && setRemovingUser(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        description={`Are you sure you want to remove ${removingUser?.name || removingUser?.email} from this project?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        isLoading={removeMember.isPending}
      />
    </DataTable>
  );
}
