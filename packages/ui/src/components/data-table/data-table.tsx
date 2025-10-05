"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { DataTableSearch } from "@workspace/ui/components/data-table/data-table-search";
import { DataTableViewOptions } from "@workspace/ui/components/data-table/data-table-view-options";
import { DataTablePagination } from "@workspace/ui/components/data-table/data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search?: {
    key?: string;
    placeholder?: string;
    onSearchChange?: (value: string) => void;
  };
  onSortingChange?: (
    field: string | null,
    direction: "asc" | "desc" | null
  ) => void;
  pagination?: {
    variant?: "full" | "simple";
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
    rowCount?: number;
    manualPagination?: boolean;
    autoResetPageIndex?: boolean;
  };
  rowActions?: Array<{
    text: string;
    show?: boolean;
    showBasedOnRow?: (row: TData) => boolean;
    icon?: React.ReactNode;
    className?: string;
    onClick: (row: TData) => void;
  }>;
  enableActions?: boolean;
  header?: React.ReactNode;
  enableRowSelection?: boolean;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  onSortingChange,
  pagination,
  rowActions,
  enableActions = true,
  enableRowSelection = true,
  className,
  header,
  isLoading = false,
  error = null,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleSortingChange = React.useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      // Handle both direct value and updater function
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      setSorting(newSorting);
      // Note: onSortingChange is now called via debounced useEffect above
    },
    [sorting]
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchValue, setSearchValue] = React.useState("");
  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search handling - either internal OR external, not both
  const hasExternalCallback = Boolean(search?.onSearchChange);
  const canInternalSearch = Boolean(search?.key) && !hasExternalCallback;

  const columnsWithActions = React.useMemo(() => {
    let finalColumns = [...(columns as ColumnDef<TData, TValue>[])];

    // Add checkbox column for row selection if enabled
    if (enableRowSelection) {
      const checkboxColumn: ColumnDef<TData, unknown> = {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            //@ts-ignore
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      };
      finalColumns = [checkboxColumn, ...finalColumns];
    }

    const actions = rowActions?.filter((action) => action.show);

    // Add actions column if enabled and actions are provided
    if (enableActions && actions && actions.length > 0) {
      const actionsColumn: ColumnDef<TData, unknown> = {
        id: "actions",
        header: () => <div className="">Actions</div>,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions
                  .filter((action) => {
                    // First check if action should be shown globally
                    if (action.show === false) return false;

                    // Then check row-specific conditions
                    if (action.showBasedOnRow) {
                      return action.showBasedOnRow(row.original as TData);
                    }

                    // Default to showing if no row-specific condition
                    return true;
                  })
                  .map((action, idx) => (
                    <DropdownMenuItem
                      key={`${action.text}-${idx}`}
                      className={cn("cursor-pointer", action.className)}
                      onClick={() => action.onClick(row.original as TData)}
                    >
                      {action.icon && (
                        <span className="mr-2 inline-flex">{action.icon}</span>
                      )}
                      {action.text}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      };
      finalColumns = [...finalColumns, actionsColumn];
    }

    return finalColumns;
  }, [columns, rowActions, enableActions, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination?.manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPaginationState,
    enableRowSelection: enableRowSelection,
    manualPagination: pagination?.manualPagination || false,
    manualSorting: false, // Enable internal sorting
    rowCount: pagination?.rowCount,
    autoResetPageIndex: pagination?.autoResetPageIndex,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
  });

  // Memoize search key to prevent unnecessary re-renders
  const searchKey = React.useMemo(() => search?.key, [search?.key]);

  // Memoize search callback to prevent unnecessary re-renders
  const searchCallback = React.useMemo(
    () => search?.onSearchChange,
    [search?.onSearchChange]
  );

  // Memoize pagination callback to prevent unnecessary re-renders
  const paginationCallback = React.useMemo(
    () => pagination?.onPaginationChange,
    [pagination?.onPaginationChange]
  );

  // Track if we're waiting for debounced operations
  const [isSearchPending, setIsSearchPending] = React.useState(false);
  const [isPaginationPending, setIsPaginationPending] = React.useState(false);
  const [isSortingPending, setIsSortingPending] = React.useState(false);

  // Apply search filter - only when search value or search key changes
  React.useEffect(() => {
    if (canInternalSearch && searchKey) {
      table.getColumn(searchKey)?.setFilterValue(searchValue);
    }
  }, [searchValue, canInternalSearch, searchKey]);

  // Memoize the search change handler
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);
  return (
    <div className={cn("w-full flex flex-col gap-2 pb-2", className)}>
      <div className="flex items-center py-4">
        <DataTableSearch
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={search?.placeholder}
          disabled={isLoading || Boolean(error)}
          isPending={isLoading || isSearchPending}
        />

        <div className="flex items-center gap-2 ml-auto">
          {header}
          {isSortingPending && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <ScrollArea
        className={cn(
          "flex flex-row justify-between ",
          "w-full max-lg:w-[88vw]"
        )}
      >
        <ScrollBar orientation="horizontal" />
        <div className="rounded-md border bg-background w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {isLoading ? (
                          <Skeleton className="h-4 w-20" />
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state with skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {Array.from({ length: columns.length }).map(
                      (_, cellIndex) => (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : error ? (
                // Error state
                <TableRow>
                  <TableCell
                    colSpan={columnsWithActions.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-red-500 text-lg">⚠️</div>
                      <span className="text-red-600 font-medium">
                        Error loading data
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {error}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                // Data rows
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Empty state
                <TableRow>
                  <TableCell
                    colSpan={columnsWithActions.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-muted-foreground text-lg">📭</div>
                      <span className="text-muted-foreground">
                        No results found.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      <DataTablePagination
        table={table}
        variant={pagination?.variant}
        onPaginationChange={pagination?.onPaginationChange}
        isPending={isPaginationPending}
      />
    </div>
  );
}
