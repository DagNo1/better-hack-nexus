"use client";

import { useUpdateUser } from "@/hooks/user";
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
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@/types/project";
import { toast } from "sonner";

const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim(),
  role: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const updateUser = useUpdateUser();

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  useEffect(() => {
    if (user && open) {
      userForm.setValue("name", user.name || "");
      userForm.setValue("email", user.email);
      userForm.setValue("role", user.role || "");
    }
  }, [user, open, userForm]);

  const handleSubmit = async (data: UserFormData) => {
    if (!user) return;

    try {
      await updateUser.mutateAsync({
        id: user.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      toast.success("User updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update user:", error);
      toast.error(
        error?.message || "Failed to update user. Please try again."
      );
    }
  };

  const handleCancel = () => {
    if (user) {
      userForm.setValue("name", user.name || "");
      userForm.setValue("email", user.email);
      userForm.setValue("role", user.role || "");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            <DialogTitle>Edit User</DialogTitle>
          </div>
          <DialogDescription>
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={userForm.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              placeholder="Enter user name"
              {...userForm.register("name")}
              disabled={updateUser.isPending}
            />
            {userForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {userForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="Enter user email"
              {...userForm.register("email")}
              disabled={updateUser.isPending}
            />
            {userForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {userForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Input
              id="user-role"
              placeholder="Enter user role (optional)"
              {...userForm.register("role")}
              disabled={updateUser.isPending}
            />
            {userForm.formState.errors.role && (
              <p className="text-sm text-destructive">
                {userForm.formState.errors.role.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUser.isPending || !userForm.formState.isValid}
            >
              {updateUser.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
