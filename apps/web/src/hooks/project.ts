import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query hooks
export const useGetProjects = () =>
  useQuery(trpc.project.getAll.queryOptions());

export const useGetProjectById = (id: string) =>
  useQuery(trpc.project.getById.queryOptions({ id }));

// Mutation hooks
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.project.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getAll.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getById.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByParent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.folder.getByProject.queryKey(),
      });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create project");
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.project.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update project");
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.project.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
};

// Member management hooks for projects
export const useAddMemberToProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.project.addMember.mutationOptions(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: trpc.project.getMembers.queryKey({
          projectId: variables.projectId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
    },
  });
};

export const useRemoveMemberFromProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.project.removeMember.mutationOptions(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: trpc.project.getMembers.queryKey({
          projectId: variables.projectId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.project.getAll.queryKey(),
      });
      toast.success("Member removed from project successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove member from project");
    },
  });
};

export const useGetProjectMembers = (projectId: string) =>
  useQuery(trpc.project.getMembers.queryOptions({ projectId }));
