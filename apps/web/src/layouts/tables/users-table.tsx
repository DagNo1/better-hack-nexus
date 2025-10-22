"use client";

import { ConfirmationDialog } from "@/components/dialogs";
import { UserFormDialog } from "@/components/dialogs/user-form-dialog";
import { columns } from "@/components/table/columns/user-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import { useCreateUser, useDeleteUser, useGetUsers } from "@/hooks/user";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function UsersTable() {
  const { data: users, isLoading } = useGetUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [showForm, setShowForm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      await deleteUser.mutateAsync({ id: deletingUser.id });
      setDeletingUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      await createUser.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to create user. Please try again.");
      throw error;
    }
  };

  const actions: TableAction<User>[] = [
    {
      key: "delete",
      label: "Delete",
      icon: Trash,
      variant: "destructive",
      onClick: handleDeleteUser,
    },
  ];

  return (
    <DataTable
      data={users}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      title="Users"
      createButton={{
        label: "New User",
        onClick: () => setShowForm(true),
      }}
      emptyState={{
        title: "No Users Yet",
        description: "Get started by creating your first user",
      }}
      getRowKey={(user) => user.id}
    >
      <UserFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleFormSubmit}
        isLoading={createUser.isPending}
      />

      <ConfirmationDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteUser.isPending}
      />
    </DataTable>
  );
}
