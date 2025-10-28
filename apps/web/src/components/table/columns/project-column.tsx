import type { Project } from "@/types/project";
import type { Column } from "../data-table";
import { format } from "date-fns";

const columns: Column<Project>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[300px]",
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
  {
    key: "folders",
    label: "Folders",
    width: "w-[100px]",
    render: (value) => (value?.length || 0).toString(),
  },
];

export { columns };
