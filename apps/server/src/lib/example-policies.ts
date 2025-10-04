import type { ResourcePolicies } from "./plugins/nexus";

export const examplePolicies: ResourcePolicies = {
  document: {
    delete: (userId: string, resourceId: string) => false,
    read: (userId: string, resourceId: string) => true,
    edit: (userId: string, resourceId: string) => true,
    share: (userId: string, resourceId: string) => true,
  },
};
