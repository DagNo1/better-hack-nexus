"use client";

import { useCreateUser, useDeleteUser, useGetUsers } from "@/hooks/user";
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
import { Badge } from "@workspace/ui/components/badge";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/dialogs";
import { UserFormDialog } from "@/components/dialogs/user-form-dialog";

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

  const handleCreateUser = () => {
    setShowForm(true);
  };

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

  const isEmpty = !users || users.length === 0;

  return (
    <div className="space-y-6">
      <UsersHeader onCreateUser={handleCreateUser} />

      {isEmpty && !isLoading ? (
        <EmptyUsersState />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <UsersTableHeader />
            <TableBody>
              {isLoading ? (
                <LoadingTableRows />
              ) : (
                (users || []).map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

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
    </div>
  );
}

function UsersHeader({ onCreateUser }: { onCreateUser: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Users</h2>
      <Button onClick={onCreateUser}>
        <Plus className="h-4 w-4 mr-2" />
        New User
      </Button>
    </div>
  );
}

function EmptyUsersState() {
  return (
    <Card className="w-full flex flex-col items-center justify-center p-12 text-center">
      <CardHeader className="w-full">
        <CardTitle>No Users Yet</CardTitle>
        <CardDescription>
          Get started by creating your first user
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Email Verified</TableHead>
        <TableHead>Created</TableHead>
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
            <Skeleton className="h-4 w-[180px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface UserRowProps {
  user: User;
  onDelete: (user: User) => void;
}

function UserRow({ user, onDelete }: UserRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {user.emailVerified ? (
          <Badge variant="outline">Verified</Badge>
        ) : (
          <Badge variant="secondary">Not Verified</Badge>
        )}
      </TableCell>
      <TableCell>{format(new Date(user.createdAt), "MM/dd/yyyy")}</TableCell>
    </TableRow>
  );
}
