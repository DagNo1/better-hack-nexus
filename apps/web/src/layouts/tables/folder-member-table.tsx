import {
  ConfirmationDialog,
  FolderMemberFormDialog,
} from "@/components/dialogs";
import { columns } from "@/components/table/columns/folder-member-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import { useGetFolderUsers, useRemoveUserFromFolder } from "@/hooks/folder";
import type { FolderMember } from "@/types/api";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";

interface FolderMembersTableProps {
  folderId: string;
}

export function FolderMembersTable({ folderId }: FolderMembersTableProps) {
  const { data: members, isLoading } = useGetFolderUsers(folderId);
  const removeUser = useRemoveUserFromFolder();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingMember, setEditingMember] = useState<FolderMember | null>(
    null
  );
  const [removingUser, setRemovingUser] = useState<FolderMember | null>(null);

  const handleAddMember = () => {
    setFormMode("add");
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: FolderMember) => {
    setFormMode("edit");
    setEditingMember(member);
    setShowForm(true);
  };

  const handleRemoveMember = (user: FolderMember) => {
    setRemovingUser(user);
  };

  const handleConfirmRemove = async () => {
    if (!removingUser) return;

    try {
      await removeUser.mutateAsync({
        folderId,
        userId: removingUser.id,
      });
      setRemovingUser(null);
    } catch (error) {
      console.error("Failed to remove user from folder:", error);
    }
  };

  const actions: TableAction<FolderMember>[] = [
    {
      key: "edit",
      label: "Edit Role",
      icon: Edit,
      onClick: handleEditMember,
      condition: (member) => member.role.toLowerCase() !== "owner",
      permission: {
        resourceType: "folder",
        resourceId: folderId,
        action: "share",
      },
    },
    {
      key: "remove",
      label: "Remove from Folder",
      icon: Trash,
      variant: "destructive",
      onClick: handleRemoveMember,
      condition: (member) => member.role.toLowerCase() !== "owner",
      permission: {
        resourceType: "folder",
        resourceId: folderId,
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
      title="Folder Members"
      createButton={{
        label: "Add Member",
        onClick: handleAddMember,
      }}
      emptyState={{
        title: "No Members Yet",
        description: "Get started by adding members to this folder",
      }}
      getRowKey={(member) => member.id}
    >
      <FolderMemberFormDialog
        mode={formMode}
        folderId={folderId}
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
        description={`Are you sure you want to remove ${removingUser?.name || removingUser?.email} from this folder?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        isLoading={removeUser.isPending}
      />
    </DataTable>
  );
}
