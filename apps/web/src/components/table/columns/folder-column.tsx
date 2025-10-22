import type { Folder } from "@/types/project";
import { FolderIcon } from "lucide-react";
import type { Column } from "../data-table";
import { formatDate } from "../data-table";

const columns: Column<Folder>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[300px]",
    render: (value) => (
      <div className="flex items-center gap-2">
        <FolderIcon className="h-4 w-4 text-muted-foreground" />
        {value}
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    width: "w-[120px]",
    render: (value) => formatDate(value),
  },
  {
    key: "updatedAt",
    label: "Updated",
    width: "w-[120px]",
    render: (value) => formatDate(value),
  },
];

export { columns };
