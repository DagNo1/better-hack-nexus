# DataTable Component

A reusable, generic table component that handles common CRUD operations, permissions, loading states, and empty states.

## Features

- **Generic Type Support**: Works with any data type
- **Permission-based Actions**: Integrates with Zanzibar permissions
- **Loading & Empty States**: Built-in skeleton loading and empty state handling
- **CRUD Operations**: Create, edit, delete with confirmation dialogs
- **Customizable Columns**: Define columns with custom renderers
- **Row Actions**: Dropdown menu with permission-checked actions
- **Responsive Design**: Consistent styling with the design system

## Basic Usage

```tsx
import { DataTable, Column, TableAction } from "@/components/table";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

function UsersTable() {
  const columns: Column<User>[] = [
    { key: "name", label: "Name", width: "w-[200px]" },
    { key: "email", label: "Email", width: "w-[250px]" },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
  ];

  const actions: TableAction<User>[] = [
    {
      key: "delete",
      label: "Delete",
      icon: Trash,
      variant: "destructive",
      onClick: handleDelete,
      permission: {
        resourceType: "user",
        resourceId: (user) => user.id,
        action: "delete",
      },
    },
  ];

  return (
    <DataTable
      data={users}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      title="Users"
      createButton={{
        label: "New User",
        onClick: () => setShowForm(true),
      }}
      emptyState={{
        title: "No Users Yet",
        description: "Get started by creating your first user",
      }}
      getRowKey={(user) => user.id}
    >
      {/* Form and confirmation dialogs as children */}
      <UserFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        isLoading={createUser.isPending}
      />
      <ConfirmationDialog
        open={!!deletingUser}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Delete ${deletingUser?.name}?`}
      />
    </DataTable>
  );
}
```

## Props

### DataTableProps<T>

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | No | Array of data items to display |
| `isLoading` | `boolean` | No | Show loading skeleton |
| `columns` | `Column<T>[]` | Yes | Column definitions |
| `actions` | `TableAction<T>[]` | No | Row action definitions |
| `title` | `string` | Yes | Table title |
| `createButton` | `object` | No | Create button configuration |
| `emptyState` | `object` | No | Empty state configuration |
| `loadingRowsCount` | `number` | No | Number of loading rows (default: 6) |
| `onRowClick` | `function` | No | Row click handler |
| `getRowKey` | `function` | Yes | Function to get unique key for each row |
| `children` | `ReactNode` | No | Form and confirmation dialogs |

### Column<T>

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `keyof T \| string` | Yes | Data field key |
| `label` | `string` | Yes | Column header label |
| `width` | `string` | No | CSS width class |
| `render` | `function` | No | Custom cell renderer |
| `sortable` | `boolean` | No | Enable column sorting |

### TableAction<T>

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | Unique action identifier |
| `label` | `string` | Yes | Action button text |
| `icon` | `Component` | No | Action icon component |
| `onClick` | `function` | Yes | Action click handler |
| `variant` | `string` | No | Button variant (default/destructive) |
| `permission` | `object` | No | Permission requirements |
| `condition` | `function` | No | Conditional visibility |

## Built-in Loading Support

The DataTable component includes automatic loading skeleton support:

```tsx
<DataTable
  data={users}
  isLoading={isLoading} // Shows loading skeleton when true
  columns={columns}
  actions={actions}
  title="Users"
  getRowKey={(user) => user.id}
  loadingRowsCount={6} // Optional: customize number of skeleton rows
>
  {/* Dialogs as children */}
</DataTable>
```

When `isLoading` is `true`, the DataTable automatically displays skeleton rows that match the table structure, including the correct number of columns (data columns + actions column).

## Loading Components

For custom loading implementations or standalone use:

### LoadingRows
Basic loading skeleton with uniform cell widths:
```tsx
import { LoadingRows } from "@/components/table";

// Used internally by DataTable when isLoading={true}
<LoadingRows count={6} columnsCount={5} />
```

### LoadingRowsFlexible
Advanced loading skeleton with customizable cell widths:
```tsx
import { LoadingRowsFlexible } from "@/components/table";

<LoadingRowsFlexible
  count={6}
  columnsCount={5}
  skeletonWidths={["w-[200px]", "w-[150px]", "w-[100px]", "w-[120px]", "w-[80px]"]}
/>
```

### LoadingTableRows (Backward Compatibility)
Legacy component from table-skeleton.tsx:
```tsx
import { LoadingTableRows } from "@/components/table";

<LoadingTableRows count={6} columnsCount={5} />
```

### formatDate(date: string | Date): string
Formats a date using the consistent MM/dd/yyyy format.

```tsx
import { formatDate } from "@/components/table";

// Usage in column render
{
  key: "createdAt",
  label: "Created",
  render: (value) => formatDate(value),
}
```

### renderBadge(value, options?): ReactNode
Renders a badge with conditional styling.

```tsx
import { renderBadge } from "@/components/table";

// Usage in column render
{
  key: "status",
  label: "Status",
  render: (value) => renderBadge(value, {
    trueLabel: "Active",
    falseLabel: "Inactive",
    trueVariant: "outline",
    falseVariant: "secondary"
  }),
}
```

## Permission Integration

The component integrates with Zanzibar permissions for both create buttons and row actions:

```tsx
const actions: TableAction<User>[] = [
  {
    key: "edit",
    label: "Edit",
    icon: Edit,
    onClick: handleEdit,
    permission: {
      resourceType: "user",
      resourceId: (user) => user.id, // Can be a function or static string
      action: "edit",
    },
  },
];

const createButton = {
  label: "New User",
  onClick: () => setShowForm(true),
  permission: {
    resourceType: "user",
    resourceId: "global", // Optional for global permissions
    action: "create",
  },
};
```

## Migration from Existing Tables

To migrate an existing table component:

1. Define the data type interface
2. Create columns array with proper configuration
3. Create actions array for row operations
4. Replace the table structure with DataTable component
5. Move form and confirmation dialogs as children

## Examples

See the updated `users-table.tsx` for a complete example of the migration.
