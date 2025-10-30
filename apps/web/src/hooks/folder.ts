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

// Mutation hooks
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.create.mutationOptions(),
    onSuccess: (data, variables) => {
      console.log("useCreateFolder: Mutation succeeded with data:", data);

      // Invalidate queries in a more targeted way to avoid race conditions
      const invalidatePromises = [];

      // Always invalidate all folders
      invalidatePromises.push(
        queryClient.invalidateQueries({
          queryKey: trpc.folder.getAll.queryKey(),
        })
      );

      // Invalidate project-specific folder queries if projectId exists
      if (variables.projectId) {
        invalidatePromises.push(
          queryClient.invalidateQueries({
            queryKey: trpc.folder.getByProject.queryKey({
              projectId: variables.projectId,
            }),
          })
        );

        // Invalidate project queries for this specific project
        invalidatePromises.push(
          queryClient.invalidateQueries({
            queryKey: trpc.project.getById.queryKey({
              id: variables.projectId,
            }),
          })
        );
      }

      // Invalidate parent folder queries if parentId exists
      if (variables.parentId) {
        invalidatePromises.push(
          queryClient.invalidateQueries({
            queryKey: trpc.folder.getById.queryKey({
              id: variables.parentId,
            }),
          })
        );
      }

      // Invalidate all projects to update folder counts
      invalidatePromises.push(
        queryClient.invalidateQueries({
          queryKey: trpc.project.getAll.queryKey(),
        })
      );

      // Wait for all invalidations to complete
      Promise.all(invalidatePromises).catch(console.error);

      // Don't show success toast here as it's handled in the component
    },
    onError: (error: any, variables) => {
      console.error(
        "useCreateFolder: Mutation failed with error:",
        error,
        "variables:",
        variables
      );
      // Don't show error toast here as it's handled in the component
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.update.mutationOptions(),
    onSuccess: (data, variables) => {
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

// User management hooks for folders
export const useAddUserToFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.addUser.mutationOptions(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getUsers.queryKey({
          folderId: variables.folderId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByProject.queryKey(),
      });
      toast.success("User added to folder successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add user to folder");
    },
  });
};

export const useRemoveUserFromFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folder.removeUser.mutationOptions(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getUsers.queryKey({
          folderId: variables.folderId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByProject.queryKey(),
      });
      toast.success("User removed from folder successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove user from folder");
    },
  });
};

export const useGetFolderUsers = (folderId: string) =>
  useQuery(trpc.folder.getUsers.queryOptions({ folderId }));
