import { createOwnerRelationship, createMemberRelationship } from "./base";

// Project relationships
export const projectRelationships = {
  owner: createOwnerRelationship("project"),
  member: createOwnerRelationship("project"), // For now, only owner is a member
};
