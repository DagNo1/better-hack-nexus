"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetProjects } from "@/hooks/project";
import { useGetFolderUsers, useGetFoldersByProject } from "@/hooks/folder";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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

type Option = { id: string; name: string };

type FolderUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export function FolderUsersTable() {
  const { data: projects = [], isLoading: loadingProjects } = useGetProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (!loadingProjects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [loadingProjects, projects, selectedProjectId]);

  const { data: folders = [], isLoading: loadingFolders } =
    useGetFoldersByProject(selectedProjectId || "");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  useEffect(() => {
    if (!loadingFolders && folders.length > 0) {
      if (
        !selectedFolderId ||
        !folders.find((f: any) => f.id === selectedFolderId)
      ) {
        setSelectedFolderId(folders[0].id);
      }
    } else if (!loadingFolders && folders.length === 0) {
      setSelectedFolderId("");
    }
  }, [loadingFolders, folders, selectedFolderId]);

  const { data: users = [], isLoading: loadingUsers } = useGetFolderUsers(
    selectedFolderId || ""
  );

  const projectOptions: Option[] = useMemo(
    () => projects.map((p: any) => ({ id: p.id, name: p.name })),
    [projects]
  );
  const folderOptions: Option[] = useMemo(
    () => folders.map((f: any) => ({ id: f.id, name: f.name })),
    [folders]
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

  const rows: FolderUserRow[] = (users as any[]).map((u) => ({
    id: u.id,
    name: u.name ?? null,
    email: u.email ?? null,
    role: u.role,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle>Folder Members</CardTitle>
            <CardDescription className="mt-1">
              Filter by project and folder
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Select
                value={selectedProjectId}
                onValueChange={(v) => {
                  setSelectedProjectId(v);
                  setSelectedFolderId("");
                }}
              >
                <SelectTrigger className="w-full">
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
            <div className="w-full sm:w-64">
              <Select
                value={selectedFolderId}
                onValueChange={(v) => setSelectedFolderId(v)}
                disabled={
                  !selectedProjectId ||
                  loadingFolders ||
                  folderOptions.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !selectedProjectId
                        ? "Select project first"
                        : loadingFolders
                          ? "Loading folders..."
                          : folderOptions.length === 0
                            ? "No folders"
                            : "Select folder"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns as any}
            data={rows as any}
            isLoading={loadingProjects || loadingFolders || loadingUsers}
            enableRowSelection={false}
            enableActions={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
