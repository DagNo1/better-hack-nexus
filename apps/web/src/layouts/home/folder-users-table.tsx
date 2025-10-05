"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetProjects } from "@/hooks/project";
import { useGetFolderUsers, useGetFoldersByProject } from "@/hooks/folder";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { DataTable } from "@workspace/ui/components/data-table/data-table";

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

  const { data: folders = [], isLoading: loadingFolders } = useGetFoldersByProject(
    selectedProjectId || ""
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  useEffect(() => {
    if (!loadingFolders && folders.length > 0) {
      if (!selectedFolderId || !folders.find((f: any) => f.id === selectedFolderId)) {
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
      { header: "Role", accessorKey: "role" },
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
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Folder Members</CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-56">
              <Select
                value={selectedProjectId}
                onValueChange={(v) => {
                  setSelectedProjectId(v);
                  setSelectedFolderId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select project"} />
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
            <div className="w-56">
              <Select
                value={selectedFolderId}
                onValueChange={(v) => setSelectedFolderId(v)}
                disabled={!selectedProjectId || loadingFolders || folderOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedProjectId
                      ? "Select project first"
                      : loadingFolders
                      ? "Loading folders..."
                      : folderOptions.length === 0
                      ? "No folders"
                      : "Select folder"
                  } />
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
        <DataTable
          columns={columns as any}
          data={rows as any}
          isLoading={loadingProjects || loadingFolders || loadingUsers}
          enableRowSelection={false}
          enableActions={false}
        />
      </CardContent>
    </Card>
  );
}


