import { ConfirmationDialog, DocumentFormDialog } from "@/components/dialogs";
import { columns } from "@/components/table/columns/document-column";
import { DataTable, type TableAction } from "@/components/table/data-table";
import { useDeleteDocument, useGetDocumentsByFolder } from "@/hooks/file";
import type { Document } from "@/types/api";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";

interface DocumentsTableProps {
  folderId: string;
}

export function DocumentsTable({ folderId }: DocumentsTableProps) {
  const { data: documents, isLoading } = useGetDocumentsByFolder(folderId);
  const deleteDocument = useDeleteDocument();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null
  );

  const handleCreateDocument = () => {
    setFormMode("create");
    setEditingDocument(null);
    setShowForm(true);
  };

  const handleEditDocument = (document: Document) => {
    setFormMode("edit");
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setDeletingDocument(document);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDocument) return;

    try {
      await deleteDocument.mutateAsync({ id: deletingDocument.id });
      setDeletingDocument(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const actions: TableAction<Document>[] = [
    {
      key: "edit",
      label: "Edit",
      icon: Edit,
      onClick: handleEditDocument,
      permission: {
        resourceType: "document",
        resourceId: (document) => document.id,
        action: "edit",
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: Trash,
      variant: "destructive",
      onClick: handleDeleteDocument,
      permission: {
        resourceType: "document",
        resourceId: (document) => document.id,
        action: "delete",
      },
    },
  ];

  return (
    <DataTable
      data={documents}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      title="Documents"
      createButton={{
        label: "New Document",
        onClick: handleCreateDocument,
      }}
      emptyState={{
        title: "No Documents Yet",
        description: "Get started by creating your first document",
      }}
      getRowKey={(document) => document.id}
    >
      <DocumentFormDialog
        mode={formMode}
        document={editingDocument}
        folderId={folderId}
        open={showForm}
        onOpenChange={setShowForm}
      />

      <ConfirmationDialog
        open={!!deletingDocument}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        description={`Are you sure you want to delete "${deletingDocument?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteDocument.isPending}
      />
    </DataTable>
  );
}
