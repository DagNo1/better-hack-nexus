"use client";

import {
  useAddUserToProject,
  useGetProjectUsers,
  useRemoveUserFromProject,
} from "@/hooks/project";
import type { ProjectMember } from "@/types/project";
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
import { Edit, Mail, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useState } from "react";
import {
  ProjectMemberFormDialog,
  ConfirmationDialog,
} from "@/components/dialogs";

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

  const isEmpty = !members || members.length === 0;

  return (
    <div className="space-y-6">
      <MembersHeader onAddMember={handleAddMember} />

      {isEmpty && !isLoading ? (
        <EmptyMembersState />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <MembersTableHeader />
            <TableBody>
              {isLoading ? (
                <LoadingTableRows />
              ) : (
                (members || []).map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onEdit={handleEditMember}
                    onRemove={handleRemoveMember}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

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
    </div>
  );
}

function MembersHeader({ onAddMember }: { onAddMember: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Project Members</h2>
      <Button onClick={onAddMember}>
        <Plus className="h-4 w-4 mr-2" />
        Add Member
      </Button>
    </div>
  );
}

function EmptyMembersState() {
  return (
    <Card className="w-full flex flex-col items-center justify-center p-12 text-center">
      <CardHeader className="w-full">
        <CardTitle>No Members Yet</CardTitle>
        <CardDescription>
          Get started by adding members to this project
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function MembersTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[250px]">Name</TableHead>
        <TableHead className="w-[300px]">Email</TableHead>
        <TableHead>Role</TableHead>
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
            <Skeleton className="h-4 w-[180px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface MemberRowProps {
  member: ProjectMember;
  onEdit: (member: ProjectMember) => void;
  onRemove: (user: ProjectMember) => void;
}

function MemberRow({ member, onEdit, onRemove }: MemberRowProps) {
  const isOwner = member.role.toLowerCase() === "owner";

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{member.name || "—"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {member.email}
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
          {member.role}
        </span>
      </TableCell>
      <TableCell>
        {!isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(member)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                variant="destructive"
                onClick={() => onRemove(member)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Remove from Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
