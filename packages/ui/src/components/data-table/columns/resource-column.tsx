import React, { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { DataTable } from "@workspace/ui/components/data-table/data-table";

// Interfaces
export interface ResourceRole {
  id: string;
  name: string;
  label: string;
  description?: string;
}

export interface ResourceTableData {
  id: string;
  [key: string]: any;
  roles?: Record<string, boolean>;
}

export interface ResourceColumnDef {
  key: string;
  header: string;
  type?: "text" | "number" | "date" | "checkbox" | "custom";
  sortable?: boolean;
  render?: (value: any, row: ResourceTableData) => React.ReactNode;
}

export interface ResourceTableConfig {
  columns: ResourceColumnDef[];
  roles: ResourceRole[];
  actions?: Array<{
    text: string;
    show?: boolean;
    showBasedOnRow?: (row: ResourceTableData) => boolean;
    icon?: React.ReactNode;
    className?: string;
    onClick: (row: ResourceTableData) => void;
  }>;
}

export interface ResourceTableProps {
  data: ResourceTableData[];
  config: ResourceTableConfig;
  search?: {
    key?: string;
    placeholder?: string;
    onSearchChange?: (value: string) => void;
  };
  onSortingChange?: (
    field: string | null,
    direction: "asc" | "desc" | null
  ) => void;
  pagination?: {
    variant?: "full" | "simple";
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
    rowCount?: number;
    manualPagination?: boolean;
    autoResetPageIndex?: boolean;
  };
  enableRowSelection?: boolean;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

// =====================
// Column Generator
// =====================
export function createResourceColumns(
  config: ResourceTableConfig,
  updateRow: (id: string, key: string, value: any) => void
): ColumnDef<ResourceTableData>[] {
  const { columns, roles } = config;

  const dynamicColumns: ColumnDef<ResourceTableData>[] = [];

  // Standard columns
  columns.forEach((colDef) => {
    const column: ColumnDef<ResourceTableData> = {
      accessorKey: colDef.key,
      header:
        colDef.sortable !== false
          ? ({ column }) => (
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                {colDef.header}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          : colDef.header,
      cell: ({ row }) => {
        const value = row.getValue(colDef.key);

        // Prioritize custom render if exists
        if (colDef.render) return colDef.render(value, row.original);

        switch (colDef.type) {
          case "date":
            if (!value) return null;
            return (
              <div className="font-medium">
                {format(new Date(value as string), "EEEE, MMMM d, h:mm a")}
              </div>
            );
          case "checkbox":
            return (
              <Checkbox
                checked={!!value}
                onCheckedChange={(checked) =>
                  updateRow(row.original.id, colDef.key, checked)
                }
                aria-label={colDef.header}
              />
            );
          case "number":
            return (
              <div className="font-medium text-right">
                {value?.toLocaleString()}
              </div>
            );
          default:
            return <div className="font-medium px-3">{value?.toString()}</div>;
        }
      },
    };

    dynamicColumns.push(column);
  });

  // Role columns
  roles.forEach((role) => {
    dynamicColumns.push({
      accessorKey: `roles.${role.id}`,
      header: role.label,
      cell: ({ row }) => {
        const checked = row.original.roles?.[role.id] || false;
        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(val) =>
              updateRow(row.original.id, `roles.${role.id}`, val)
            }
            aria-label={`Enable ${role.name}`}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    });
  });

  return dynamicColumns;
}

// =====================
// ResourceTable Component
// =====================
export const ResourceTable: React.FC<ResourceTableProps> = ({
  data,
  config,
  ...props
}) => {
  const [tableData, setTableData] = useState<ResourceTableData[]>(data);

  const updateRow = (id: string, key: string, value: any) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        // Nested update for roles
        if (key.startsWith("roles.")) {
          const roleKey = key.split(".")[1];
          if (!roleKey) return row; // Safety check for malformed key
          return { ...row, roles: { ...row.roles, [roleKey as keyof ResourceTableData['roles']]: value } };
        }
        return { ...row, [key]: value };
      })
    );
  };

  const columns = useMemo(
    () => createResourceColumns(config, updateRow),
    [config]
  );

  return <DataTable columns={columns} data={tableData} {...props} />;
};
