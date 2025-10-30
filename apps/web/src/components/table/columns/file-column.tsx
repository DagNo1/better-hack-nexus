import { FileIcon } from "lucide-react";
import type { Column } from "../data-table";
import { format } from "date-fns";

export interface File {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  folderId: string;
}

const columns: Column<File>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[300px]",
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        {value}
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    width: "w-[120px]",
    render: (value) => format(value, "MM/dd/yyyy"),
  },
  {
    key: "updatedAt",
    label: "Updated",
    width: "w-[120px]",
    render: (value) => format(value, "MM/dd/yyyy"),
  },
];

export { columns };
