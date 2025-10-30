import type { Folder } from "@/types/project";
import { FolderIcon } from "lucide-react";
import type { Column } from "../data-table";
import { format } from "date-fns";
import Link from "next/link";

const columns: Column<Folder>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[300px]",
    render: (value, row) => (
      <Link
        href={`/folder/${row.id}`}
        className="flex items-center gap-2 underline text-blue-300 hover:text-blue-500 transition-colors group"
      >
        <FolderIcon className="h-4 w-4 text-blue-300 group-hover:text-blue-500 transition-colors" />
        {value}
      </Link>
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
