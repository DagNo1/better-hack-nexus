// Static role options for project users
export const PROJECT_ROLES = [
  { value: "owner", label: "Owner", color: "bg-red-100 text-red-800" },
  { value: "admin", label: "Admin", color: "bg-orange-100 text-orange-800" },
  { value: "editor", label: "Editor", color: "bg-blue-100 text-blue-800" },
  { value: "viewer", label: "Viewer", color: "bg-green-100 text-green-800" },
] as const;

export type ProjectRole = typeof PROJECT_ROLES[number]["value"];
