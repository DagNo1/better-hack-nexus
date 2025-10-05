import { fileRelationships } from "./file";
import { folderRelationships } from "./folder";
import { projectRelationships } from "./project";
import { todoRelationships } from "./todo";
import { userRelationships } from "./user";

// Export all relationships in a structured way
export const allRelationships = {
  project: projectRelationships,
  folder: folderRelationships,
  file: fileRelationships,
  todo: todoRelationships,
  user: userRelationships,
};

// Export base functions for creating custom relationships
export * from "./base";
