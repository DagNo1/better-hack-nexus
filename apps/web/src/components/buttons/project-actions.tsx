import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Edit, Trash } from "lucide-react";
import { useState, useEffect } from "react";

interface ProjectActionButtonsProps {
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectActionButtons({
  projectId,
  onEdit,
  onDelete,
}: ProjectActionButtonsProps) {
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const checks = {
        edit: {
          resourceType: "project",
          resourceId: projectId,
          action: "edit",
        },
        delete: {
          resourceType: "project",
          resourceId: projectId,
          action: "delete",
        },
      };

      // Single batch API call
      await authClient.zanzibar.hasPermissions(
        { checks },
        {
          onSuccess: (data) => {
            const permissions = data.data ?? {};
            setCanEdit(permissions.edit?.allowed ?? false);
            setCanDelete(permissions.delete?.allowed ?? false);
          },
          onError: (error) => {
            console.error("Failed to check permissions:", error);
          },
        }
      );
    };

    checkPermissions();
  }, [projectId]);

  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
      {canDelete && (
        <Button variant="destructive" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </div>
  );
}
