"use client";

import { useCreateUser } from "@/hooks/user";
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
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const createUser = useCreateUser();

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    try {
      await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        role: data.role || "user",
      });
      toast.success("User created successfully!");
      userForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create user:", error);
      toast.error(
        error?.message || "Failed to create user. Please try again."
      );
    }
  };

  const handleCancel = () => {
    userForm.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <DialogTitle>Create New User</DialogTitle>
          </div>
          <DialogDescription>
            Add a new user to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={userForm.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              placeholder="Enter user name"
              {...userForm.register("name")}
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending || !userForm.formState.isValid}
            >
              {createUser.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
