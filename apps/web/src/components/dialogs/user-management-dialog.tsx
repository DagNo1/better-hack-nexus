"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { X, UserPlus, Edit, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useCreateTestUser, useUpdateUser } from "@/hooks/user";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  users: User[];
  onAddUser: (userId: string, role: string) => void;
  onRemoveUser: (userId: string) => void;
  isLoading?: boolean;
  resourceType?: "project" | "folder";
}

const DEFAULT_USER_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

export function UserManagementDialog({
  open,
  onOpenChange,
  title,
  description,
  users,
  onAddUser,
  onRemoveUser,
  isLoading = false,
  resourceType = "project",
}: UserManagementDialogProps) {
  const [userName, setUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("viewer");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_USER_ROLES);

  useEffect(() => {
    let mounted = true;
    async function loadRoles() {
      try {
        // Fallback to default roles if getResourceRoles is not available
        if (
          !authClient.zanzibar ||
          typeof (authClient.zanzibar as any).getResourceRoles !== "function"
        ) {
          setAvailableRoles(DEFAULT_USER_ROLES);
          if (!DEFAULT_USER_ROLES?.find((r) => r.value === newUserRole)) {
            setNewUserRole(DEFAULT_USER_ROLES?.[0]?.value ?? "viewer");
          }
          return;
        }
        const resp = await (authClient.zanzibar as any).getResourceRoles({
          resourceType,
        });
        const roles = ((resp as any)?.data?.roles ?? []).map((r: any) => ({
          value: r.name,
          label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
        }));
        if (mounted && roles.length) {
          setAvailableRoles(roles);
          if (!roles.find((r: any) => r.value === newUserRole)) {
            setNewUserRole(roles[0].value);
          }
        }
      } catch (e) {
        // fall back to defaults
      }
    }
    loadRoles();
    return () => {
      mounted = false;
    };
  }, [resourceType]);

  const createTestUser = useCreateTestUser();
  const updateUser = useUpdateUser();

  const handleAddUser = async () => {
    if (!userName.trim()) {
      toast.error("Please enter a user name");
      return;
    }

    // Check if user is already in the list
    const existingUser = users.find(
      (user) => user.name.toLowerCase() === userName.toLowerCase()
    );
    if (existingUser) {
      toast.error("User is already added to this project/folder");
      return;
    }

    try {
      // Create a test user with the provided name and role
      const newUser = await createTestUser.mutateAsync({
        email: `${userName.trim().toLowerCase().replace(/\s+/g, ".")}@test.local`,
      });

      await onAddUser(newUser.id, newUserRole);
      setUserName("");
      toast.success(`User "${newUser.name}" added successfully!`);
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user. Please try again.");
    }
  };

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setEditingRole(currentRole);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole("");
  };

  const handleSaveRole = async (userId: string) => {
    if (!editingRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: userId,
        role: editingRole,
      });
      setEditingUserId(null);
      setEditingRole("");
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role. Please try again.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await onRemoveUser(userId);
      toast.success(`User removed successfully!`);
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add User Section */}
          <div className="space-y-3">
            <Label>Add New User</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="user-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="user-name"
                  placeholder="Enter user name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Select
                  value={newUserRole}
                  onValueChange={setNewUserRole}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddUser}
                disabled={isLoading || !userName.trim()}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Current Users */}
          <div className="space-y-2">
            <Label>Current Users ({users.length})</Label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {users.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No users added yet
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingUserId === user.id ? (
                          <Select
                            value={editingRole}
                            onValueChange={setEditingRole}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-8 w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((role: { value: string; label: string }) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge>
                            {availableRoles.find(
                              (role) => role.value === user.role
                            )?.label || user.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingUserId === user.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveRole(user.id)}
                            disabled={isLoading || !editingRole}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(user.id, user.role)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
