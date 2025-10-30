import type { Project } from "@/types/api";
import type { Column } from "../data-table";
import { formatDate } from "../data-table";

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
    render: (value) => formatDate(value),
  },
  {
    key: "updatedAt",
    label: "Updated",
    width: "w-[120px]",
    render: (value) => formatDate(value),
  },
  {
    key: "folders",
    label: "Folders",
    width: "w-[100px]",
    render: (value) => (value?.length || 0).toString(),
  },
];

export { columns };
