# better-hack-nexus

> **Proof of Concept & Example Project** for [`better-auth-zanzibar-plugin`](https://www.npmjs.com/package/better-auth-zanzibar-plugin)

This project demonstrates the [`better-auth-zanzibar-plugin`](https://www.npmjs.com/package/better-auth-zanzibar-plugin), a plugin for Better Auth that implements Google's Zanzibar-style **Relationship-Based Access Control (ReBAC)**. This example showcases how to build hierarchical permission systems with automatic inheritance using the plugin.

## About the Plugin

The `better-auth-zanzibar-plugin` enables relationship-based access control in your Better Auth applications. It provides:
- **Hierarchical Permissions**: Define relationships between resources (projects → folders → files)
- **Role-Based Access Control**: Create roles (owner, editor, viewer) with granular permissions
- **Permission Inheritance**: Automatically inherit permissions from parent resources
- **Type-Safe APIs**: Full TypeScript support with tRPC integration

## What This Example Demonstrates

This project implements a document management system with:

- **Projects** - Top-level containers that can have members with different roles
- **Folders** - Hierarchical containers that inherit permissions from parent projects/folders
- **Files** - Documents that inherit permissions from their containing folder
- **Roles & Permissions**:
  - **Owner**: Full control (delete, edit, read, share, manage members)
  - **Editor**: Can read and edit content
  - **Viewer**: Read-only access

The example shows how folder permissions automatically inherit from parent projects or folders, and how file permissions inherit from their containing folder - all handled automatically by the Zanzibar plugin.

## Tech Stack

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines:

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Elysia** - Type-safe, high-performance framework
- **tRPC** - End-to-end type-safe APIs
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Better Auth** - Authentication with the Zanzibar plugin for authorization
- **Turborepo** - Optimized monorepo build system

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database running

### Installation

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

### Database Setup

1. Update your `apps/server/.env` file with your PostgreSQL connection details:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

2. Generate the Prisma client and push the schema:

```bash
pnpm db:push
```

3. (Optional) Seed the database with sample data:

```bash
pnpm db:seed
```

### Running the Application

Start the development server:

```bash
pnpm dev
```

- **Web Application**: [http://localhost:3001](http://localhost:3001)
- **API Server**: [http://localhost:3000](http://localhost:3000)

## Understanding the Implementation

### Zanzibar Plugin Configuration

The plugin is configured in `apps/server/src/lib/auth/auth.ts`:

```typescript
import { ZanzibarPlugin } from "better-auth-zanzibar-plugin";
import policies from "./rebac";

export const auth = betterAuth({
  // ... other config
  plugins: [ZanzibarPlugin(policies)],
});
```

### Permission Schema

The access control schema is defined in `apps/server/src/lib/auth/rebac.ts`, which demonstrates:

- Resource definitions (project, folder, file, user)
- Role-based permissions (owner, editor, viewer)
- Dynamic permission policies with database queries
- Permission inheritance across hierarchical resources

### Client-Side Usage

The React client uses `ZanzibarClientPlugin` for permission checks:

```typescript
// apps/web/src/lib/auth-client.ts
import { ZanzibarClientPlugin } from "better-auth-zanzibar-plugin";

export const authClient = createAuthClient({
  plugins: [ZanzibarClientPlugin()],
});
```







## Project Structure

```
better-hack-nexus/
├── apps/
│   ├── web/                    # Frontend application (Next.js)
│   │   └── src/
│   │       ├── lib/
│   │       │   └── auth-client.ts    # Better Auth client with Zanzibar plugin
│   │       └── components/
│   │           └── auth/
│   │               └── can-access.tsx # Permission-based component wrapper
│   └── server/                  # Backend API (Elysia, tRPC)
│       └── src/
│           └── lib/
│               └── auth/
│                   ├── auth.ts       # Better Auth with Zanzibar plugin
│                   └── rebac.ts      # Permission schema and policies
└── packages/                    # Shared packages
    └── ui/                      # Shared UI components
```

## Key Implementation Files

- **`apps/server/src/lib/auth/auth.ts`** - Better Auth configuration with Zanzibar plugin
- **`apps/server/src/lib/auth/rebac.ts`** - ReBAC schema, roles, and permission policies
- **`apps/web/src/lib/auth-client.ts`** - Client-side auth configuration
- **`apps/web/src/components/auth/can-access.tsx`** - React component for permission checks

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications for production
- `pnpm dev:web`: Start only the web application
- `pnpm dev:server`: Start only the server
- `pnpm check-types`: Check TypeScript types across all apps
- `pnpm db:push`: Push Prisma schema changes to database
- `pnpm db:studio`: Open Prisma Studio (database UI)
- `pnpm db:seed`: Seed database with sample data

## Learn More

- **Plugin Package**: [`better-auth-zanzibar-plugin`](https://www.npmjs.com/package/better-auth-zanzibar-plugin) on npm
- **Better Auth**: [Documentation](https://www.better-auth.com)
- **Zanzibar Paper**: [Google's Zanzibar paper](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/) for more on ReBAC concepts

## License

This example project is provided as-is for demonstration purposes.
