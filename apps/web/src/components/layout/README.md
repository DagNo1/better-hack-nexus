# Layout Components

This directory contains reusable layout components that provide consistent page structure and patterns across the application.

## Components

### PageLayout

A wrapper component that provides the basic page structure with optional header and main content areas.

```tsx
import { PageLayout } from "@/components/layout";

<PageLayout maxWidth="w-4xl">
  <YourContent />
</PageLayout>
```

**Props:**
- `children`: ReactNode - The main content of the page
- `className?`: string - Additional CSS classes
- `header?`: ReactNode - Optional header content
- `maxWidth?`: string - Maximum width class (default: "w-5xl")

### PageHeader

A header component that includes title, subtitle, back navigation, and action buttons.

```tsx
import { PageHeader } from "@/components/layout";

<PageHeader
  title="Project Name"
  subtitle="Created Jan 1, 2024 • Updated Jan 2, 2024"
  onBack={() => router.push("/projects")}
  actions={<YourActionButtons />}
/>
```

**Props:**
- `title`: string - The main title
- `subtitle?`: string - Optional subtitle
- `onBack?`: () => void - Back navigation handler
- `backTo?`: string - Back navigation URL (alternative to onBack)
- `actions?`: ReactNode - Action buttons (typically ActionButtons component)
- `className?`: string - Additional CSS classes

### ActionButtons

A component that renders action buttons with permission checking using the Zanzibar authorization system.

```tsx
import { ActionButtons } from "@/components/layout";

<ActionButtons
  actions={[
    {
      key: "edit",
      label: "Edit",
      icon: <Edit className="h-4 w-4 mr-2" />,
      variant: "outline",
      onClick: handleEdit,
      permission: {
        resourceType: "project",
        resourceId: projectId,
        action: "manage",
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash className="h-4 w-4 mr-2" />,
      variant: "destructive",
      onClick: handleDelete,
      permission: {
        resourceType: "project",
        resourceId: projectId,
        action: "delete",
      },
    },
  ]}
/>
```

**ActionButton Interface:**
- `key`: string - Unique identifier for the action
- `label`: string - Button text
- `icon?`: ReactNode - Optional icon
- `variant?`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `onClick`: () => void - Click handler
- `permission?`: Permission object for authorization check

### LoadingState

A skeleton loading component that shows placeholder content while data is loading.

```tsx
import { LoadingState } from "@/components/layout";

<LoadingState
  header={<Skeleton className="h-8 w-48" />}
  sections={2}
/>
```

**Props:**
- `header?`: ReactNode - Optional header skeleton
- `title?`: string - Optional title skeleton
- `sections?`: number - Number of content skeleton sections (default: 2)
- `className?`: string - Additional CSS classes

### NotFoundState

A component for displaying "not found" or error states with consistent styling.

```tsx
import { NotFoundState } from "@/components/layout";

<NotFoundState
  title="Project Not Found"
  description="The project you're looking for doesn't exist or you don't have permission to view it."
  action={{
    label: "Back to Projects",
    onClick: () => router.push("/projects"),
    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
  }}
/>
```

**Props:**
- `header?`: ReactNode - Optional header content
- `title?`: string - Error title (default: "Not Found")
- `description?`: string - Error description
- `action?`: Action object with label, onClick, and optional icon
- `className?`: string - Additional CSS classes

### AuthWrapper

A wrapper component that handles authentication state and displays appropriate content.

```tsx
import { AuthWrapper } from "@/components/layout";

<AuthWrapper
  userButtonClassName="bg-background text-white hover:bg-primary/10"
  signedInContent={<ProtectedContent />}
  signedOutContent={<RedirectToSignIn />}
/>
```

**Props:**
- `children?`: ReactNode - Content for authenticated users (default for signedInContent)
- `signedInContent?`: ReactNode - Content for authenticated users
- `signedOutContent?`: ReactNode - Content for unauthenticated users
- `fallback?`: ReactNode - Fallback content (default: RedirectToSignIn)
- `userButtonClassName?`: string - Additional classes for UserButton

## Usage Examples

### Project Detail Page
```tsx
export default function ProjectDetailPage() {
  const { data: project, isLoading } = useGetProjectById(projectId);

  if (isLoading) {
    return <LoadingState sections={2} />;
  }

  if (!project) {
    return (
      <NotFoundState
        description="Project not found or no permission to view it."
        action={{
          label: "Back to Projects",
          onClick: () => router.push("/projects"),
        }}
      />
    );
  }

  return (
    <PageLayout>
      <AuthWrapper>
        <PageHeader
          title={project.name}
          subtitle={`Created ${formatDate(project.createdAt)}`}
          onBack={() => router.push("/projects")}
          actions={
            <ActionButtons actions={[/* edit, delete actions */]} />
          }
        />
      </AuthWrapper>

      <div className="space-y-8">
        <ProjectMembersTable projectId={projectId} />
        <FoldersTable projectId={projectId} />
      </div>
    </PageLayout>
  );
}
```

### Folder Creation Page
```tsx
export default function CreateFolderPage() {
  return (
    <PageLayout>
      <AuthWrapper>
        <PageHeader
          title="Create New Folder"
          onBack={() => router.push(`/project/${projectId}`)}
        />
      </AuthWrapper>

      <FolderFormDialog
        mode="create"
        projectId={projectId}
        open={true}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
      />
    </PageLayout>
  );
}
```

## Benefits

1. **Consistency**: All pages follow the same layout patterns
2. **Reusability**: Components can be used across different page types
3. **Permission Handling**: Built-in permission checking for action buttons
4. **Loading States**: Consistent loading UI across the application
5. **Error Handling**: Standardized error/not found states
6. **Authentication**: Automatic handling of auth states
7. **Accessibility**: Built with accessibility best practices
8. **Type Safety**: Full TypeScript support with proper interfaces
