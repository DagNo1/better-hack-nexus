import type { User } from "@/types/project";
import type { Column } from "../data-table";
import { formatDate, renderBadge } from "../data-table";

const columns: Column<Omit<User, "role">>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[200px]",
  },
  {
    key: "email",
    label: "Email",
    width: "w-[250px]",
  },
  {
    key: "emailVerified",
    label: "Email Verified",
    width: "w-[150px]",
    render: (value) =>
      renderBadge(value, {
        trueLabel: "Verified",
        falseLabel: "Not Verified",
        trueVariant: "outline",
        falseVariant: "secondary",
      }),
  },
  {
    key: "createdAt",
    label: "Created",
    width: "w-[120px]",
    render: (value) => formatDate(value),
  },
];

export { columns };
