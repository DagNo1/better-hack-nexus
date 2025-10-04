import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


// Query hooks
export const useGetFolders = () =>
  useQuery(trpc.folder.getAll.queryOptions());

export const useGetFolderById = (id: string) =>
  useQuery(trpc.folder.getById.queryOptions({ id }));

export const useGetFoldersByProject = (projectId: string) =>
  useQuery(trpc.folder.getByProject.queryOptions({ projectId }));


// Mutation hooks
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      toast.success("Folder created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create folder");
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      toast.success("Folder updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update folder");
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      toast.success("Folder deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete folder");
    },
  });
};