"use client";

import { useAddMemberToProject } from "@/hooks/project";
import { useGetUsers } from "@/hooks/user";
import type { ProjectMember } from "@/types/project";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { UserPlus, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectMemberFormDialogProps {
  mode: "add" | "edit";
  projectId: string;
  member?: ProjectMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMemberIds?: string[];
}

export function ProjectMemberFormDialog({
  mode,
  projectId,
  member,
  open,
  onOpenChange,
  existingMemberIds = [],
}: ProjectMemberFormDialogProps) {
  const { data: allUsers, isLoading: isLoadingUsers } = useGetUsers();
  const addMember = useAddMemberToProject();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("editor");

  // Filter out users who are already members (only for add mode)
  const existingMemberIdsSet = new Set(existingMemberIds);
  const availableUsers =
    mode === "add"
      ? allUsers?.filter((user) => !existingMemberIdsSet.has(user.id)) || []
      : [];

  useEffect(() => {
    if (mode === "edit" && member && open) {
      setSelectedUserId(member.id);
      setSelectedRole(member.role);
    } else if (mode === "add") {
      setSelectedUserId("");
      setSelectedRole("editor");
    }
  }, [mode, member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    try {
      await addMember.mutateAsync({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      });
      toast.success(
        mode === "add"
          ? "Member added successfully!"
          : "Member role updated successfully!"
      );
      setSelectedUserId("");
      setSelectedRole("editor");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save member:", error);
      toast.error(
        error?.message ||
          `Failed to ${mode === "add" ? "add" : "update"} member. Please try again.`
      );
    }
  };

  const handleCancel = () => {
    setSelectedUserId("");
    setSelectedRole("editor");
    onOpenChange(false);
  };

  const Icon = mode === "add" ? UserPlus : Edit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <DialogTitle>
              {mode === "add" ? "Add Project Member" : "Edit Member Role"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === "add"
              ? "Add an existing user to this project."
              : "Update the member's role in this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" ? (
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              {isLoadingUsers ? (
                <div className="text-sm text-muted-foreground">
                  Loading users...
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No available users to add. All users are already members.
                </div>
              ) : (
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>User</Label>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  {member?.name || member?.email}
                </p>
                <p className="text-xs text-muted-foreground">{member?.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={addUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                addUser.isPending ||
                !selectedUserId ||
                (mode === "add" && availableUsers.length === 0)
              }
            >
              {addUser.isPending
                ? mode === "add"
                  ? "Adding..."
                  : "Updating..."
                : mode === "add"
                  ? "Add Member"
                  : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
