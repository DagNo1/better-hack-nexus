import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query hooks
export const useGetFolders = () => useQuery(trpc.folder.getAll.queryOptions());

export const useGetFolderById = (id: string) =>
  useQuery(trpc.folder.getById.queryOptions({ id }));
export const useGetFoldersByProject = (projectId: string) =>
  useQuery(trpc.folder.getByProject.queryOptions({ projectId }));
export const useGetFoldersByParent = (parentId: string) =>
  useQuery(trpc.folder.getByParent.queryOptions({ parentId }));

export const useGetFolderPath = (folderId: string) =>
  useQuery(trpc.folder.getPath.queryOptions({ folderId }));

// Mutation hooks
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.create.mutationOptions(),
    onSuccess: () => {
      // Invalidate all folder queries
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getById.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByProject.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByParent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getPath.queryKey(),
      });

      // Invalidate project queries
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.project.getById.queryKey(),
      });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.update.mutationOptions(),
    onSuccess: () => {
      // Invalidate all folder queries
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getById.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByProject.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByParent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getPath.queryKey(),
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
      // Invalidate all folder queries
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getById.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByProject.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByParent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getPath.queryKey(),
      });

      // Invalidate project queries
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.project.getById.queryKey(),
      });

      toast.success("Folder deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete folder");
    },
  });
};
