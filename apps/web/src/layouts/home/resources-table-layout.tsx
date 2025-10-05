"use client";

import React, { useEffect, useState, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  createResourceColumns,
  type ResourceTableData,
  type ResourceTableConfig,
  type ResourceColumnDef,
} from "@workspace/ui/components/data-table/columns/resource-column";
interface ApiRole {
  name: string;
  actions: string[];
}

interface ApiResource {
  actions: string[];
  roles: ApiRole[];
}

interface ApiResponse {
  data: {
    resources: Record<string, ApiResource>;
  };
  error: string | null;
}

interface ResourceTableWrapper {
  title: string;
  data: ResourceTableData[];
  config: ResourceTableConfig;
}

export default function ResourcesTableLayout() {
  const [tables, setTables] = useState<ResourceTableWrapper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const response = await authClient.zanzibar.resources();
        const resources = ((response as any)?.data?.resources ?? {}) as Record<
          string,
          ApiResource
        >;

        const tableWrappers: ResourceTableWrapper[] = (
          Object.entries(resources) as Array<[string, ApiResource]>
        ).map(([resourceKey, resource]) => {
          // First column shows the action label on the left
          const columns: ResourceColumnDef[] = [
            {
              key: "id",
              header: "ACTION",
              type: "text",
            },
          ];

          // Build roles (these will render as checkbox columns via generator)
          const roles = resource.roles.map((role: ApiRole) => ({
            id: role.name,
            name: role.name,
            label: role.name.toUpperCase(),
          }));

          // Build rows (now representing actions)
          const rows: ResourceTableData[] = resource.actions.map(
            (action: string) => {
              const row: ResourceTableData = { id: action, roles: {} };
              // Set role indicators (which roles have this action)
              row.roles = resource.roles.reduce(
                (acc: Record<string, boolean>, r: ApiRole) => {
                  acc[r.name] = r.actions.includes(action);
                  return acc;
                },
                {} as Record<string, boolean>
              );
              return row;
            }
          );

          return {
            title: resourceKey.toUpperCase(),
            data: rows,
            config: { columns, roles },
          };
        });

        setTables(tableWrappers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  const allColumns = useMemo(() => {
    return tables.map((table) =>
      createResourceColumns(table.config, (id, key, value) => {
        setTables((prev) =>
          prev.map((t) => {
            if (t.title !== table.title) return t;
            const updatedData = t.data.map((row) =>
              row.id === id
                ? key.startsWith("roles.")
                  ? (() => {
                      const roleKey = key.split(".")[1];
                      if (!roleKey) return row;
                      return {
                        ...row,
                        roles: {
                          ...row.roles,
                          [roleKey as keyof typeof row.roles]: value,
                        },
                      };
                    })()
                  : { ...row, [key]: value }
                : row
            );
            return { ...t, data: updatedData };
          })
        );
      })
    );
  }, [tables]);

  return (
    <div className="space-y-8">
      {tables.map((table, index) => (
        <div key={table.title}>
          <h2 className="text-xl font-semibold mb-4">{table.title}</h2>
          <DataTable
            columns={allColumns[index] ?? []}
            data={table.data}
            isLoading={loading}
            enableRowSelection={false}
            enableActions={false}
          />
        </div>
      ))}
    </div>
  );
}
