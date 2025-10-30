import { File as FileIcon } from "lucide-react";
import { formatDate, type Column } from "../data-table";
import type { File } from "@/types/api";

const columns: Column<File>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[200px]",
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        {value}
      </div>
    ),
  },
  {
    key: "content",
    label: "Content",
    width: "w-[250px]",
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
