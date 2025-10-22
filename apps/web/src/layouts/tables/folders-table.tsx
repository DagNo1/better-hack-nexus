"use client";

import {
  useCreateFolder,
  useGetFoldersByProject,
  useUpdateFolder,
} from "@/hooks/folder";
import type { Folder } from "@/types/project";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { format } from "date-fns";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Trash,
  Folder as FolderIcon,
} from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog, FolderFormDialog } from "@/components/dialogs";
import { useDeleteFolder } from "@/hooks/folder";

interface FoldersTableProps {
  projectId: string;
}

export function FoldersTable({ projectId }: FoldersTableProps) {
  const { data: folders, isLoading } = useGetFoldersByProject(projectId);
  const deleteFolder = useDeleteFolder();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);

  const handleCreateFolder = () => {
    setFormMode("create");
    setEditingFolder(null);
    setShowForm(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setFormMode("edit");
    setEditingFolder(folder);
    setShowForm(true);
  };

  const handleDeleteFolder = (folder: Folder) => {
    setDeletingFolder(folder);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFolder) return;

    try {
      await deleteFolder.mutateAsync({ id: deletingFolder.id });
      setDeletingFolder(null);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const isEmpty = !folders || folders.length === 0;

  return (
    <div className="space-y-6">
      <FoldersHeader onCreateFolder={handleCreateFolder} />

      {isEmpty && !isLoading ? (
        <EmptyFoldersState />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <FoldersTableHeader />
            <TableBody>
              {isLoading ? (
                <LoadingTableRows />
              ) : (
                (folders || []).map((folder) => (
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    onEdit={handleEditFolder}
                    onDelete={handleDeleteFolder}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <FolderFormDialog
        mode={formMode}
        folder={editingFolder}
        projectId={projectId}
        open={showForm}
        onOpenChange={setShowForm}
      />

      <ConfirmationDialog
        open={!!deletingFolder}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Folder"
        description={`Are you sure you want to delete "${deletingFolder?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteFolder.isPending}
      />
    </div>
  );
}

function FoldersHeader({ onCreateFolder }: { onCreateFolder: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Folders</h2>
      <Button onClick={onCreateFolder}>
        <Plus className="h-4 w-4 mr-2" />
        New Folder
      </Button>
    </div>
  );
}

function EmptyFoldersState() {
  return (
    <Card className="w-full flex flex-col items-center justify-center p-12 text-center">
      <CardHeader className="w-full">
        <CardTitle>No Folders Yet</CardTitle>
        <CardDescription>
          Get started by creating your first folder
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function FoldersTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[300px]">Name</TableHead>
        <TableHead>Created</TableHead>
        <TableHead>Updated</TableHead>
        <TableHead className="w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function LoadingTableRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface FolderRowProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

function FolderRow({ folder, onEdit, onDelete }: FolderRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FolderIcon className="h-4 w-4 text-muted-foreground" />
          {folder.name}
        </div>
      </TableCell>
      <TableCell>{format(new Date(folder.createdAt), "MM/dd/yyyy")}</TableCell>
      <TableCell>{format(new Date(folder.updatedAt), "MM/dd/yyyy")}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(folder)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={() => onDelete(folder)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
