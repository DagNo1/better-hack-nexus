import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query hooks
export const useGetUsers = () =>
  useQuery(trpc.user.getAll.queryOptions());

export const useGetUserById = (id: string) =>
  useQuery(trpc.user.getById.queryOptions({ id }));

export const useGetUserByEmail = (email: string) =>
  useQuery(trpc.user.getByEmail.queryOptions({ email }));

export const useCreateTestUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.user.createTestUser.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.user.getAll.queryKey(),
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create test user");
    },
  });
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.user.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.user.getAll.queryKey(),
      });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to create user";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.user.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.user.getAll.queryKey(),
      });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.user.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.user.getAll.queryKey(),
      });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
};