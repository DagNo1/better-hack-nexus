import {
  createOwnerRelationship,
  createProjectOwnerRelationship,
  createFolderOwnerRelationship,
  createMemberRelationship,
} from "./base";

// File relationships
export const fileRelationships = {
  owner: createOwnerRelationship("file"),
  projectOwner: createProjectOwnerRelationship("file"),
  folderOwner: createFolderOwnerRelationship("file"),
  member: createMemberRelationship("file", "id", [
    { relation: "folder", ownerField: "ownerId" },
  ]),
};
