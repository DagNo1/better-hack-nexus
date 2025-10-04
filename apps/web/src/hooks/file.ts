import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


// Query hooks
export const useGetFiles = () =>
  useQuery(trpc.file.getAll.queryOptions());

export const useGetFileById = (id: string) =>
  useQuery(trpc.file.getById.queryOptions({ id }));

export const useGetFilesByProject = (projectId: string) =>
  useQuery(trpc.file.getByProject.queryOptions({ projectId }));

export const useGetFilesByFolder = (folderId: string) =>
  useQuery(trpc.file.getByFolder.queryOptions({ folderId }));


// Mutation hooks
export const useCreateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.file.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.file.getAll.queryKey(),
      });
      toast.success("File created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create file");
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.file.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.file.getAll.queryKey(),
      });
      toast.success("File updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update file");
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.file.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.file.getAll.queryKey(),
      });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete file");
    },
  });
};