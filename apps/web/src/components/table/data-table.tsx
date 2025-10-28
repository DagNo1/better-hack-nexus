"use client";

import { Badge } from "@workspace/ui/components/badge";
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
import { MoreHorizontal, Plus } from "lucide-react";
import React from "react";

// Types for the table configuration
export interface Column<T = any> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  condition?: (item: T) => boolean;
}

export interface DataTableProps<T = any> {
  // Data
  data?: T[];
  isLoading?: boolean;

  // Table Configuration
  columns: Column<T>[];
  actions?: TableAction<T>[];

  // Header
  title: string;
  createButton?: {
    label: string;
    onClick: () => void;
    show?: boolean;
  };

  // Empty State
  emptyState?: {
    title: string;
    description: string;
  };

  // Loading State
  loadingRowsCount?: number;

  // Row Configuration
  onRowClick?: (item: T) => void;
  getRowKey: (item: T) => string;

  // External Dialogs (for form and confirmation)
  children?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  isLoading = false,
  columns,
  actions = [],
  title,
  createButton,
  emptyState,
  loadingRowsCount = 6,
  onRowClick,
  getRowKey,
  children,
}: DataTableProps<T>) {
  const isEmpty = !data || data.length === 0;

  return (
    <div className="space-y-6">
      <TablePageHeader title={title} createButton={createButton} />

      {isEmpty && !isLoading ? (
        <EmptyState
          title={emptyState?.title || "No data yet"}
          description={
            emptyState?.description || "Get started by creating your first item"
          }
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <DataTableHeader columns={columns} />
            <TableBody>
              {isLoading ? (
                <LoadingRows
                  count={loadingRowsCount}
                  columnsCount={columns.length + (actions.length > 0 ? 1 : 0)}
                />
              ) : (
                data?.map((item) => (
                  <DataTableRow
                    key={getRowKey(item)}
                    item={item}
                    columns={columns}
                    actions={actions}
                    onRowClick={onRowClick}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {children}
    </div>
  );
}

function TablePageHeader({
  title,
  createButton,
}: {
  title: string;
  createButton?: DataTableProps["createButton"];
}) {
  const shouldShowButton = createButton?.show ?? true;

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      {createButton && shouldShowButton && (
        <Button onClick={createButton.onClick}>
          <Plus className="h-4 w-4 mr-2" />
          {createButton.label}
        </Button>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="w-full flex flex-col items-center justify-center p-12 text-center">
      <CardHeader className="w-full">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function DataTableHeader({ columns }: { columns: Column[] }) {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={String(column.key)} className={column.width}>
            {column.label}
          </TableHead>
        ))}
        <TableHead className="w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function LoadingRows({
  count,
  columnsCount,
}: {
  count: number;
  columnsCount: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columnsCount }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// Export LoadingRows component for external use
export { LoadingRows };

// Also export a more flexible version with customizable skeleton widths
export function LoadingRowsFlexible({
  count = 6,
  columnsCount = 5,
  skeletonWidths,
}: {
  count?: number;
  columnsCount?: number;
  skeletonWidths?: string[];
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columnsCount }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton
                className={`h-4 ${skeletonWidths?.[cellIndex] || "w-full"}`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface DataTableRowProps<T> {
  item: T;
  columns: Column<T>[];
  actions: TableAction<T>[];
  onRowClick?: (item: T) => void;
}

function DataTableRow<T extends Record<string, any>>({
  item,
  columns,
  actions,
  onRowClick,
}: DataTableRowProps<T>) {
  const visibleActions = actions.filter((action) => {
    if (action.condition && !action.condition(item)) return false;
    return true;
  });

  return (
    <TableRow
      className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
      onClick={() => onRowClick?.(item)}
    >
      {columns.map((column) => (
        <TableCell key={String(column.key)}>
          {column.render
            ? column.render(item[column.key], item)
            : String(item[column.key] || "")}
        </TableCell>
      ))}
      <TableCell>
        {visibleActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  className="cursor-pointer"
                  variant={action.variant}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
