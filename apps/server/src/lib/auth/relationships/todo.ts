import {
  createOwnerRelationship,
  createProjectOwnerRelationship,
  createMemberRelationship,
} from "./base";

// Todo relationships
export const todoRelationships = {
  owner: createOwnerRelationship("todo", "id"),
  projectOwner: createProjectOwnerRelationship("todo", "id"),
  member: createMemberRelationship("todo", "id"),
};
