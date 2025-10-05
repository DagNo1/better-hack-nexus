import {
  createOwnerRelationship,
  createProjectOwnerRelationship,
  createMemberRelationship,
} from "./base";

// Folder relationships
export const folderRelationships = {
  owner: createOwnerRelationship("folder"),
  projectOwner: createProjectOwnerRelationship("folder"),
  member: createMemberRelationship("folder"),
};
