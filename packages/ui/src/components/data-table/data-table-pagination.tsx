import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  variant?: "full" | "simple";
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  isPending?: boolean;
}

export function DataTablePagination<TData>({
  table,
  variant = "simple",
  onPaginationChange,
  isPending = false,
}: DataTablePaginationProps<TData>) {
  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    table.setPageSize(newPageSize);
    onPaginationChange?.(table.getState().pagination.pageIndex, newPageSize);
  };

  const handlePageChange = (newPageIndex: number) => {
    table.setPageIndex(newPageIndex);
    onPaginationChange?.(newPageIndex, table.getState().pagination.pageSize);
  };

  const handlePreviousPage = () => {
    const newPageIndex = table.getState().pagination.pageIndex - 1;
    table.previousPage();
    onPaginationChange?.(newPageIndex, table.getState().pagination.pageSize);
  };

  const handleNextPage = () => {
    const newPageIndex = table.getState().pagination.pageIndex + 1;
    table.nextPage();
    onPaginationChange?.(newPageIndex, table.getState().pagination.pageSize);
  };

  if (variant === "simple") {
    return (
      <div className="flex flex-row items-center justify-between px-2 py-4 bg-background  rounded-md">
        <div className="text-muted-foreground  text-sm flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
          {isPending && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex flex-row gap-2">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-md bg-background px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end sm:gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page number */}
        <div className="flex min-w-0 w-full items-center justify-center text-sm font-medium sm:w-auto">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() > 0 ? table.getPageCount() : "?"}
        </div>

        {/* Navigation buttons */}
        <div className="flex min-w-0 items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 md:flex"
            onClick={() => handlePageChange(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 md:flex"
            onClick={() => handlePageChange(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
