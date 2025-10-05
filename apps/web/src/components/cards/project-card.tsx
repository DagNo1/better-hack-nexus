import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Clock,
  Edit2,
  FileText,
  Folder,
  Trash2,
  UserPlus
} from "lucide-react";

interface ProjectFile {
  id: string;
  name: string;
  content?: string;
  projectId: string | null;
}

interface ProjectFolder {
  id: string;
  name: string;
  projectId: string | null;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  folders?: ProjectFolder[];
}

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onManageUsers?: (project: Project) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onManageUsers,
  isSelected = false,
  onSelect,
}: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";   
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatProjectName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const totalItems =
    (project.files?.length || 0) + (project.folders?.length || 0);

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border hover:border-primary/20 bg-background ${
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-row items-center gap-2 justify-end w-full mb-2 border-b p-2">
              <Button
                variant={"outline"}
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageUsers?.(project);
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-110 transition-all"
                title="Manage users"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button
                variant={"outline"}
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project);
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-110 transition-all"
                title="Edit project"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant={"outline"}
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(project.id);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-110 transition-all"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {formatProjectName(project.name)}
            </CardTitle>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 w-full flex-row">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  Updated {formatDate(project.updatedAt)}
                </span>
              </div>
              {totalItems > 0 && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <div className="flex items-center gap-1">
                    <span>
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0  ">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground/70">
            Created {formatDate(project.createdAt)}
          </span>
          {(project.files && project.files.length > 0) ||
          (project.folders && project.folders.length > 0) ? (
            <div className="flex gap-3 text-muted-foreground/70">
              {project.files && project.files.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <FileText className="w-3 h-3" />
                  <span>{project.files.length}</span>
                </div>
              )}
              {project.folders && project.folders.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Folder className="w-3 h-3" />
                  <span>{project.folders.length}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
