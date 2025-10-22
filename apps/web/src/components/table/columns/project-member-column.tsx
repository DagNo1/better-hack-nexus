import { Mail } from "lucide-react";
import type { Column } from "../data-table";
import type { ProjectMember } from "@/types/project";

const columns: Column<ProjectMember>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[250px]",
  },
  {
    key: "email",
    label: "Email",
    width: "w-[300px]",
    render: (value) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        {value}
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (value) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
        {value}
      </span>
    ),
  },
];

export { columns }; 
