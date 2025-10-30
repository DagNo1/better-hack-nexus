import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query hooks
export const useGetFiles = () => useQuery(trpc.file.getAll.queryOptions());

export const useGetFileById = (id: string) =>
  useQuery(trpc.file.getById.queryOptions({ id }));

export const useGetFilesByFolder = (folderId: string) =>
  useQuery(trpc.file.getByFolder.queryOptions({ folderId }));

// Mutation hooks
export const useCreateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.file.create.mutationOptions(),
    onSuccess: (data, variables) => {
      console.log("useCreateFile: Mutation succeeded with data:", data);

      // Invalidate queries in a more targeted way to avoid race conditions
      const invalidatePromises = [];

      // Always invalidate all files
      invalidatePromises.push(
        queryClient.invalidateQueries({
          queryKey: trpc.file.getAll.queryKey(),
        })
      );

      // Invalidate folder-specific file queries if folderId exists
      if (variables.folderId) {
        invalidatePromises.push(
          queryClient.invalidateQueries({
            queryKey: trpc.file.getByFolder.queryKey({
              folderId: variables.folderId,
            }),
          })
        );

        // Invalidate folder queries for this specific folder
        invalidatePromises.push(
          queryClient.invalidateQueries({
            queryKey: trpc.folder.getById.queryKey({
              id: variables.folderId,
            }),
          })
        );
      }

      // Invalidate all folders to update file counts
      invalidatePromises.push(
        queryClient.invalidateQueries({
          queryKey: trpc.folder.getAll.queryKey(),
        })
      );

      // Wait for all invalidations to complete
      Promise.all(invalidatePromises).catch(console.error);

      // Don't show success toast here as it's handled in the component
    },
    onError: (error: any, variables) => {
      console.error(
        "useCreateFile: Mutation failed with error:",
        error,
        "variables:",
        variables
      );
      // Don't show error toast here as it's handled in the component
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.file.update.mutationOptions(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: trpc.file.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.file.getByFolder.queryKey(),
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
      queryClient.invalidateQueries({
        queryKey: trpc.file.getByFolder.queryKey(),
      });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete file");
    },
  });
};
