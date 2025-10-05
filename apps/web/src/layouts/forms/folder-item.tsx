"use client";

import { Button } from "@workspace/ui/components/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import type { Folder } from "@/types/project";

interface FolderItemProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onAddUser: (folderId: string) => void;
}

export function FolderItem({
  folder,
  onEdit,
  onDelete,
  onAddUser,
}: FolderItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-background rounded-md border">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          Created: {new Date(folder.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-1 ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddUser(folder.id)}
          className="h-8 w-8 p-0"
          title="Add user to folder"
        >
          <UserPlus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(folder)}
          className="h-8 w-8 p-0"
          title="Edit folder"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(folder.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          title="Delete folder"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}