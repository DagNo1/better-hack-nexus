import {
  ConfirmationDialog,
  ProjectMemberFormDialog,
} from "@/components/dialogs";
import { columns } from "@/components/table/columns/project-member-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import { useGetProjectUsers, useRemoveUserFromProject } from "@/hooks/project";
import type { ProjectMember } from "@/types/project";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";

interface ProjectMembersTableProps {
  projectId: string;
}

export function ProjectMembersTable({ projectId }: ProjectMembersTableProps) {
  const { data: members, isLoading } = useGetProjectUsers(projectId);
  const removeUser = useRemoveUserFromProject();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(
    null
  );
  const [removingUser, setRemovingUser] = useState<ProjectMember | null>(null);

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
      await removeUser.mutateAsync({
        projectId,
        userId: removingUser.id,
      });
      setRemovingUser(null);
    } catch (error) {
      console.error("Failed to remove user from project:", error);
    }
  };

  const actions: TableAction<ProjectMember>[] = [
    {
      key: "edit",
      label: "Edit Role",
      icon: Edit,
      onClick: handleEditMember,
      condition: (member) => member.role.toLowerCase() !== "owner",
      permission: {
        resourceType: "project",
        resourceId: projectId,
        action: "share",
      },
    },
    {
      key: "remove",
      label: "Remove from Project",
      icon: Trash,
      variant: "destructive",
      onClick: handleRemoveMember,
      condition: (member) => member.role.toLowerCase() !== "owner",
      permission: {
        resourceType: "project",
        resourceId: projectId,
        action: "share",
      },
    },
  ];

  return (
    <DataTable
      data={members}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      title="Project Members"
      createButton={{
        label: "Add Member",
        onClick: handleAddMember,
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
        isLoading={removeUser.isPending}
      />
    </DataTable>
  );
}
