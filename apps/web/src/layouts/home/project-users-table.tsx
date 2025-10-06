"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetProjectUsers, useGetProjects } from "@/hooks/project";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { Badge } from "@workspace/ui/components/badge";

type ProjectOption = { id: string; name: string };

type ProjectUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export function ProjectUsersTable() {
  const { data: projects = [], isLoading: loadingProjects } = useGetProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (!loadingProjects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [loadingProjects, projects, selectedProjectId]);

  const { data: users = [], isLoading: loadingUsers } = useGetProjectUsers(
    selectedProjectId || ""
  );

  const projectOptions: ProjectOption[] = useMemo(
    () => projects.map((p: any) => ({ id: p.id, name: p.name })),
    [projects]
  );

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ row }: any) => <Badge>{row.original.role}</Badge>,
      },
    ],
    []
  );

  const rows: ProjectUserRow[] = (users as any[]).map((u) => ({
    id: u.id,
    name: u.name ?? null,
    email: u.email ?? null,
    role: u.role,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Project Members</CardTitle>
          <div className="w-64 ">
            <Select
              value={selectedProjectId}
              onValueChange={(v) => setSelectedProjectId(v)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingProjects ? "Loading projects..." : "Select project"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns as any}
          data={rows as any}
          isLoading={loadingProjects || loadingUsers}
          enableRowSelection={false}
          enableActions={false}
        />
      </CardContent>
    </Card>
  );
}
