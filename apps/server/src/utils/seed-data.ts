export const SAMPLE_USERS = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin@example.com",
    role: "admin",
    emailVerified: true,
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "john@example.com",
    role: "user",
    emailVerified: true,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "jane@example.com",
    role: "user",
    emailVerified: true,
  },
  {
    name: "Bob Wilson",
    email: "bob@example.com",
    password: "bob@example.com",
    role: "user",
    emailVerified: true,
  },
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "alice@example.com",
    role: "user",
    emailVerified: true,
  },
];

export const SAMPLE_PROJECTS = [
  {
    name: "Better Auth Zanzibar Plugin",
    ownerEmail: "admin@example.com",
    members: [
      { email: "john@example.com", role: "editor" },
      { email: "jane@example.com", role: "editor" },
      { email: "bob@example.com", role: "viewer" },
    ],
    folders: [
      {
        name: "Core Implementation",
        documents: [
          {
            name: "Plugin Architecture",
            content:
              "# Plugin Architecture\n\n## Overview\nThe better-auth-zanzibar-plugin is a first-party plugin for better-auth that implements Google's Zanzibar-style ReBAC (Relationship-Based Access Control).\n\n## Integration with Better Auth\nThe plugin seamlessly integrates with better-auth's plugin system:\n\n```typescript\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\n\nconst auth = betterAuth({\n  database: prisma,\n  plugins: [\n    zanzibar({\n      schema: './schema.ts',\n      enableCache: true,\n    })\n  ],\n});\n```\n\n## Key Components\n- Relationship Tuples Storage (uses better-auth's database adapter)\n- Permission Evaluation Engine\n- Session Integration\n- Type-Safe API with tRPC support",
          },
          {
            name: "ReBAC Engine",
            content:
              "# ReBAC Engine\n\n## Relationship-Based Access Control with Better Auth\n\nThe plugin extends better-auth's session management with Google Zanzibar's authorization model.\n\n### How it Works with Better Auth\n1. User authenticates via better-auth (email, OAuth, passkey, etc.)\n2. Session is created with better-auth's session management\n3. Zanzibar plugin checks permissions using the authenticated user's ID\n4. Relations and permissions are evaluated in real-time\n\n### Core Concepts\n- **Objects**: Resources like projects, folders, files\n- **Relations**: Connections (owner, editor, viewer) stored as tuples\n- **Permissions**: Computed from relations (edit = owner OR editor)\n- **Subjects**: Better-auth user IDs from active sessions",
          },
        ],
        subfolders: [
          {
            name: "Database Schema",
            documents: [
              {
                name: "Tuple Storage",
                content:
                  "# Tuple Storage Schema\n\n```prisma\nmodel RelationTuple {\n  id          String\n  namespace   String\n  objectId    String\n  relation    String\n  subjectId   String\n  createdAt   DateTime\n}\n```",
              },
              {
                name: "Indexes & Performance",
                content:
                  "# Database Indexes\n\n## Critical Indexes\n- (namespace, objectId, relation)\n- (subjectId, namespace)\n- (namespace, relation)\n\nThese enable fast permission checks at scale.",
              },
            ],
            subfolders: [
              {
                name: "Migrations",
                documents: [
                  {
                    name: "Initial Schema",
                    content:
                      "# Initial Migration\n\n```sql\nCREATE TABLE relation_tuples (\n  id VARCHAR(255) PRIMARY KEY,\n  namespace VARCHAR(255) NOT NULL,\n  object_id VARCHAR(255) NOT NULL,\n  relation VARCHAR(255) NOT NULL,\n  subject_id VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n```",
                  },
                ],
              },
              {
                name: "Adapters",
                documents: [
                  {
                    name: "Prisma Adapter",
                    content:
                      "# Prisma Adapter for Better Auth Zanzibar\n\n## Overview\nThe plugin uses the same Prisma client as better-auth, sharing the database connection.\n\n## Schema\nAdd this to your Prisma schema alongside better-auth models:\n\n```prisma\n// Better Auth models (user, session, account, etc.)\nmodel User {\n  id String @id\n  email String @unique\n  // ... other better-auth fields\n  \n  // Relations for Zanzibar\n  relationTuples RelationTuple[]\n}\n\n// Zanzibar Plugin model\nmodel RelationTuple {\n  id String @id @default(cuid())\n  namespace String\n  objectId String\n  relation String\n  subjectId String\n  subjectType String @default(\"user\")\n  createdAt DateTime @default(now())\n  \n  user User @relation(fields: [subjectId], references: [id], onDelete: Cascade)\n  \n  @@unique([namespace, objectId, relation, subjectId])\n  @@index([namespace, objectId, relation])\n  @@index([subjectId, namespace])\n  @@map(\"relation_tuples\")\n}\n```\n\n## Supported Databases\n- PostgreSQL (recommended for production)\n- MySQL\n- SQLite (good for development)\n- MongoDB (via Prisma MongoDB adapter)\n\n## Integration\n```typescript\nimport { PrismaClient } from '@prisma/client';\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\n\nconst prisma = new PrismaClient();\n\nexport const auth = betterAuth({\n  database: prisma, // Same Prisma instance for both!\n  plugins: [zanzibar()],\n});\n```",
                  },
                  {
                    name: "Drizzle Adapter",
                    content:
                      "# Drizzle Adapter\n\nAlternative adapter using Drizzle ORM for type-safe database operations.",
                  },
                ],
              },
            ],
          },
          {
            name: "Permission Evaluation",
            documents: [
              {
                name: "Check Algorithm",
                content:
                  "# Permission Check Algorithm\n\n1. Parse permission request\n2. Lookup direct relations\n3. Recursively expand computed relations\n4. Check inheritance hierarchy\n5. Return authorization decision",
              },
            ],
            subfolders: [
              {
                name: "Cache Layer",
                documents: [
                  {
                    name: "In-Memory Cache",
                    content:
                      "# In-Memory Caching\n\nLRU cache for frequently checked permissions.\n\n## Configuration\n- Max size: 10,000 entries\n- TTL: 5 minutes\n- Eviction policy: LRU",
                  },
                  {
                    name: "Redis Cache",
                    content:
                      "# Redis Integration\n\nDistributed caching for multi-instance deployments.\n\n```typescript\nconst cache = new RedisCache({\n  host: 'localhost',\n  port: 6379,\n  ttl: 300,\n});\n```",
                  },
                ],
              },
              {
                name: "Optimization",
                documents: [
                  {
                    name: "Query Batching",
                    content:
                      "# Query Batching\n\nBatch multiple permission checks into a single database query for improved performance.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "API Documentation",
        documents: [
          {
            name: "Getting Started",
            content:
              "# Getting Started with Better Auth Zanzibar Plugin\n\n## Prerequisites\nFirst, you need better-auth installed:\n```bash\nnpm install better-auth\n```\n\n## Installation\n```bash\nnpm install better-auth-zanzibar-plugin\n```\n\n## Basic Setup\n```typescript\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\nimport { PrismaClient } from '@prisma/client';\n\nconst prisma = new PrismaClient();\n\nexport const auth = betterAuth({\n  database: prisma,\n  emailAndPassword: {\n    enabled: true,\n  },\n  plugins: [\n    zanzibar({\n      schema: {\n        project: {\n          relations: {\n            owner: ['user'],\n            editor: ['user', 'owner'],\n            viewer: ['user', 'editor'],\n          },\n          permissions: {\n            edit: 'editor',\n            delete: 'owner',\n            view: 'viewer',\n          },\n        },\n      },\n    }),\n  ],\n});\n```\n\n## What This Does\n- Sets up better-auth with email/password authentication\n- Adds the Zanzibar plugin for authorization\n- Defines a schema for project permissions\n- Ready to use with tRPC, Express, or any framework",
          },
          {
            name: "API Reference",
            content:
              "# Better Auth Zanzibar Plugin API Reference\n\n## Core Methods\n\n### auth.api.checkPermission()\nChecks if a user has permission on a resource.\n\n```typescript\nconst canEdit = await auth.api.checkPermission({\n  userId: session.user.id, // from better-auth session\n  action: 'edit',\n  resource: 'project',\n  resourceId: 'project_123',\n});\n```\n\n### auth.api.addRelation()\nCreates a relationship tuple.\n\n```typescript\nawait auth.api.addRelation({\n  subjectId: 'user_alice',\n  relation: 'editor',\n  objectType: 'project',\n  objectId: 'project_123',\n});\n```\n\n### auth.api.removeRelation()\nDeletes a relationship tuple.\n\n```typescript\nawait auth.api.removeRelation({\n  subjectId: 'user_alice',\n  relation: 'editor',\n  objectType: 'project',\n  objectId: 'project_123',\n});\n```\n\n### auth.api.expandRelations()\nReturns all subjects with a relation to an object.\n\n```typescript\nconst editors = await auth.api.expandRelations({\n  objectType: 'project',\n  objectId: 'project_123',\n  relation: 'editor',\n});\n// Returns: ['user_alice', 'user_bob']\n```\n\n## Integration with Better Auth Sessions\n\nAll methods work seamlessly with better-auth's session management:\n\n```typescript\nimport { auth } from './auth';\n\n// In your API route\nexport async function GET(req: Request) {\n  const session = await auth.api.getSession({ headers: req.headers });\n  \n  if (!session) {\n    return new Response('Unauthorized', { status: 401 });\n  }\n  \n  const canView = await auth.api.checkPermission({\n    userId: session.user.id,\n    action: 'view',\n    resource: 'project',\n    resourceId: params.id,\n  });\n  \n  if (!canView) {\n    return new Response('Forbidden', { status: 403 });\n  }\n  \n  // Handle request\n}\n```",
          },
        ],
      },
    ],
  },
  {
    name: "Plugin Documentation Site",
    ownerEmail: "john@example.com",
    members: [
      { email: "jane@example.com", role: "editor" },
      { email: "alice@example.com", role: "viewer" },
    ],
    folders: [
      {
        name: "User Guides",
        documents: [
          {
            name: "Quick Start Guide",
            content:
              "# Quick Start Guide: Better Auth + Zanzibar Plugin\n\n## 5-Minute Setup\n\n### Step 1: Install Better Auth\n```bash\nnpm install better-auth\nnpm install @prisma/client\n```\n\n### Step 2: Install the Zanzibar Plugin\n```bash\nnpm install better-auth-zanzibar-plugin\n```\n\n### Step 3: Configure Better Auth with the Plugin\n```typescript\n// auth.ts\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\n\nexport const auth = betterAuth({\n  database: prisma,\n  emailAndPassword: { enabled: true },\n  plugins: [zanzibar()],\n});\n```\n\n### Step 4: Define Your Permission Schema\n```typescript\nzanzibar({\n  schema: {\n    document: {\n      relations: {\n        owner: ['user'],\n        editor: ['user', 'owner'],\n        viewer: ['user', 'editor'],\n      },\n      permissions: {\n        edit: 'editor',\n        delete: 'owner',\n        view: 'viewer',\n      },\n    },\n  },\n})\n```\n\n### Step 5: Check Permissions in Your App\n```typescript\n// Get session from better-auth\nconst session = await auth.api.getSession({ headers });\n\n// Check permission using the plugin\nconst canEdit = await auth.api.checkPermission({\n  userId: session.user.id,\n  action: 'edit',\n  resource: 'document',\n  resourceId: 'doc_123',\n});\n```\n\nThat's it! You now have authentication (better-auth) + authorization (zanzibar plugin) working together.",
          },
          {
            name: "Concepts & Terminology",
            content:
              "# Core Concepts: Better Auth + Zanzibar\n\n## Authentication vs Authorization\n\n### Better Auth (Authentication)\n- **Who are you?**\n- Handles login, signup, sessions\n- Supports email/password, OAuth, passkeys, magic links\n- Manages user identity\n\n### Zanzibar Plugin (Authorization)\n- **What can you do?**\n- Handles permissions and access control\n- Based on relationships between users and resources\n- Manages resource access\n\n## The Zanzibar Model\n\n### Namespaces (Resource Types)\nLogical grouping of objects in your application:\n- `project` - your projects\n- `folder` - folders within projects  \n- `file` - files within folders\n\n### Relations (User-Resource Connections)\nHow users relate to resources:\n- `owner` - full control\n- `editor` - can modify\n- `viewer` - can only read\n\n### Tuples (Stored Relationships)\nStatements that define who has what relation:\n```\nuser:alice → owner → project:123\nuser:bob → editor → project:123\nuser:charlie → viewer → folder:456\n```\n\n### Permissions (Actions)\nWhat actions can be performed:\n- `view` - read access\n- `edit` - modify access\n- `delete` - remove access\n\n## How They Work Together\n\n1. User logs in with better-auth\n2. Better-auth creates a session\n3. User tries to access a resource\n4. Zanzibar plugin checks if user's session ID has the required relation\n5. Access granted or denied based on the evaluation\n\n## Example Flow\n```typescript\n// 1. User authenticates with better-auth\nconst session = await auth.api.signIn.email({\n  email: 'alice@example.com',\n  password: 'secure_password',\n});\n\n// 2. Better-auth creates session\n// session.user.id = 'user_alice'\n\n// 3. Add permission using Zanzibar plugin\nawait auth.api.addRelation({\n  subjectId: session.user.id,\n  relation: 'owner',\n  objectType: 'project',\n  objectId: 'proj_123',\n});\n\n// 4. Check permission later\nconst canEdit = await auth.api.checkPermission({\n  userId: session.user.id,\n  action: 'edit',\n  resource: 'project',\n  resourceId: 'proj_123',\n});\n// Returns: true (because owner includes editor permissions)\n```",
          },
        ],
        subfolders: [
          {
            name: "Advanced Topics",
            documents: [
              {
                name: "Hierarchical Permissions",
                content:
                  "# Hierarchical Permissions with Better Auth Zanzibar\n\n## Inheritance Patterns\n\nOne of the most powerful features of the Zanzibar plugin is hierarchical permissions - permissions cascade down through your resource hierarchy.\n\n## Example: Project → Folder → File\n\nWhen a user has a role on a project, they automatically get that role on all folders and files within it.\n\n### Schema Definition\n```typescript\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\n\nexport const auth = betterAuth({\n  plugins: [\n    zanzibar({\n      schema: {\n        project: {\n          relations: {\n            owner: ['user'],\n            editor: ['user', 'owner'],\n            viewer: ['user', 'editor'],\n          },\n        },\n        folder: {\n          relations: {\n            project: ['project'], // Link to parent\n            owner: ['user', 'project#owner'], // Inherit from project\n            editor: ['user', 'project#editor'],\n            viewer: ['user', 'project#viewer'],\n          },\n        },\n        file: {\n          relations: {\n            folder: ['folder'], // Link to parent\n            owner: ['user', 'folder#owner'], // Inherit from folder\n            editor: ['user', 'folder#editor'],\n            viewer: ['user', 'folder#viewer'],\n          },\n        },\n      },\n    }),\n  ],\n});\n```\n\n## How It Works\n\n1. Alice is made owner of Project123:\n```typescript\nawait auth.api.addRelation({\n  subjectId: 'user_alice',\n  relation: 'owner',\n  objectType: 'project',\n  objectId: 'project_123',\n});\n```\n\n2. A folder is created and linked to the project:\n```typescript\nawait auth.api.addRelation({\n  subjectId: 'project_123',\n  relation: 'project',\n  objectType: 'folder',\n  objectId: 'folder_456',\n});\n```\n\n3. Now Alice automatically has owner access to folder_456!\n```typescript\nconst canEdit = await auth.api.checkPermission({\n  userId: 'user_alice',\n  action: 'edit',\n  resource: 'folder',\n  resourceId: 'folder_456',\n});\n// Returns: true (inherited from project ownership)\n```\n\n## Benefits\n\n- **DRY Permissions**: Set once at the top, applies everywhere below\n- **Consistent Access**: Team members get uniform access across related resources\n- **Easy Management**: Add someone to a project, they get access to everything in it\n- **Automatic Updates**: Remove project access, all child access is revoked instantly\n- **Better-Auth Integration**: Uses better-auth session user IDs throughout",
              },
              {
                name: "Performance Optimization",
                content:
                  "# Performance Optimization\n\n## Caching Strategies\n- In-memory caching\n- Redis integration\n- Query optimization\n\n## Benchmarks\nSub-millisecond permission checks at scale.",
              },
            ],
            subfolders: [
              {
                name: "Schema Design",
                documents: [
                  {
                    name: "Best Practices",
                    content:
                      "# Schema Design Best Practices\n\n1. Keep namespaces granular\n2. Use computed relations for inheritance\n3. Avoid circular dependencies\n4. Plan for scale from day one",
                  },
                ],
                subfolders: [
                  {
                    name: "Examples",
                    documents: [
                      {
                        name: "Multi-Tenant SaaS",
                        content:
                          "# Multi-Tenant SaaS Schema\n\n```yaml\norganization:\n  relations:\n    admin: [user]\n    member: [user]\n    \nworkspace:\n  relations:\n    org: [organization]\n    owner: [user, org.admin]\n    member: [user, org.member]\n```",
                      },
                      {
                        name: "Social Network",
                        content:
                          "# Social Network Schema\n\n```yaml\npost:\n  relations:\n    author: [user]\n    viewer: [user, author, follower]\n    \nuser:\n  relations:\n    follower: [user]\n```",
                      },
                    ],
                  },
                ],
              },
              {
                name: "Security Considerations",
                documents: [
                  {
                    name: "Common Pitfalls",
                    content:
                      "# Security Pitfalls\n\n## 1. Over-Permissive Relations\nAvoid granting broad permissions that bypass intended restrictions.\n\n## 2. Missing Permission Checks\nAlways validate permissions before data access.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Examples & Tutorials",
        documents: [
          {
            name: "Document Management System",
            content:
              "# Tutorial: Building a Document Management System\n\n## Goal\nBuild a Google Drive-like app using better-auth for login and the Zanzibar plugin for permissions.\n\n## Architecture\n```\nProjects → Folders → Files\n```\n\n## Step 1: Setup Better Auth\n```typescript\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\n\nexport const auth = betterAuth({\n  database: prisma,\n  emailAndPassword: { enabled: true },\n  socialProviders: {\n    google: {\n      clientId: process.env.GOOGLE_CLIENT_ID!,\n      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,\n    },\n  },\n  plugins: [\n    zanzibar({\n      schema: {\n        project: {\n          relations: {\n            owner: ['user'],\n            editor: ['user', 'owner'],\n            viewer: ['user', 'editor'],\n          },\n          permissions: {\n            delete: 'owner',\n            edit: 'editor',\n            view: 'viewer',\n          },\n        },\n        folder: {\n          relations: {\n            project: ['project'],\n            owner: ['user', 'project#owner'],\n            editor: ['user', 'project#editor'],\n            viewer: ['user', 'project#viewer'],\n          },\n          permissions: {\n            delete: 'owner',\n            edit: 'editor',\n            view: 'viewer',\n          },\n        },\n        file: {\n          relations: {\n            folder: ['folder'],\n            owner: ['user', 'folder#owner'],\n            editor: ['user', 'folder#editor'],\n            viewer: ['user', 'folder#viewer'],\n          },\n          permissions: {\n            delete: 'owner',\n            edit: 'editor',\n            view: 'viewer',\n          },\n        },\n      },\n    }),\n  ],\n});\n```\n\n## Step 2: Create a Project\n```typescript\n// Create project in database\nconst project = await prisma.project.create({\n  data: { name: 'My Project', ownerId: session.user.id },\n});\n\n// Add owner relation\nawait auth.api.addRelation({\n  subjectId: session.user.id,\n  relation: 'owner',\n  objectType: 'project',\n  objectId: project.id,\n});\n```\n\n## Step 3: Share with Team Members\n```typescript\n// Add editor\nawait auth.api.addRelation({\n  subjectId: 'user_bob',\n  relation: 'editor',\n  objectType: 'project',\n  objectId: project.id,\n});\n\n// Add viewer\nawait auth.api.addRelation({\n  subjectId: 'user_charlie',\n  relation: 'viewer',\n  objectType: 'project',\n  objectId: project.id,\n});\n```\n\n## Step 4: Create Folders (Inherits Project Permissions!)\n```typescript\nconst folder = await prisma.folder.create({\n  data: { name: 'Documents', projectId: project.id },\n});\n\n// Link folder to project for inheritance\nawait auth.api.addRelation({\n  subjectId: `project:${project.id}`,\n  relation: 'project',\n  objectType: 'folder',\n  objectId: folder.id,\n});\n\n// Now bob (editor) and charlie (viewer) automatically have access!\n```\n\n## Step 5: Check Permissions Before Actions\n```typescript\n// Before allowing delete\nconst canDelete = await auth.api.checkPermission({\n  userId: session.user.id,\n  action: 'delete',\n  resource: 'folder',\n  resourceId: folder.id,\n});\n\nif (!canDelete) {\n  return new Response('Forbidden', { status: 403 });\n}\n\n// Delete folder\nawait prisma.folder.delete({ where: { id: folder.id } });\n```\n\n## Permission Inheritance\nThe magic of this setup:\n- Project owner can edit/delete everything\n- Project editor can edit folders and files (but not delete project)\n- Project viewer can only view\n- Permissions cascade down: Project → Folder → File\n- Change someone's project role, and all nested permissions update automatically!",
          },
        ],
      },
    ],
  },
  {
    name: "Example Applications",
    ownerEmail: "jane@example.com",
    members: [
      { email: "john@example.com", role: "editor" },
      { email: "bob@example.com", role: "editor" },
    ],
    folders: [
      {
        name: "Next.js Example",
        documents: [
          {
            name: "Setup Instructions",
            content:
              '# Next.js + Better Auth + Zanzibar Example\n\n## Features\n- Better-auth for authentication (email, Google OAuth)\n- Zanzibar plugin for fine-grained permissions\n- Server-side permission checks in API routes\n- Client-side permission gates\n- Protected pages and components\n- UI that adapts based on user roles\n\n## Installation\n```bash\ncd examples/nextjs\nnpm install\n```\n\n## Environment Setup\n```env\n# .env.local\nDATABASE_URL="postgresql://..."\nBETTER_AUTH_SECRET="your-secret"\nBETTER_AUTH_URL="http://localhost:3000"\n\n# OAuth (optional)\nGOOGLE_CLIENT_ID="your-google-client-id"\nGOOGLE_CLIENT_SECRET="your-google-client-secret"\n```\n\n## Run Database Migrations\n```bash\nnpx prisma migrate dev\n```\n\n## Start the App\n```bash\nnpm run dev\n```\n\n## Project Structure\n```\nsrc/\n├── lib/\n│   └── auth.ts          # Better-auth + Zanzibar config\n├── app/\n│   ├── api/\n│   │   ├── auth/[...all]/route.ts  # Better-auth handlers\n│   │   └── projects/route.ts        # Protected API routes\n│   ├── login/page.tsx               # Login with better-auth\n│   └── dashboard/page.tsx           # Protected page\n└── components/\n    └── permission-gate.tsx          # Client-side gates\n```\n\n## Try It Out\n\n1. Sign up: http://localhost:3000/signup\n2. Create a project (you become owner)\n3. Invite team members with different roles\n4. See how permissions control UI and API access\n5. Test inheritance: project → folder → file permissions',
          },
          {
            name: "Middleware Implementation",
            content:
              "# Next.js Middleware with Better Auth + Zanzibar\n\n## Overview\nProtect entire routes using better-auth for authentication and Zanzibar for authorization.\n\n## middleware.ts\n```typescript\nimport { NextRequest, NextResponse } from 'next/server';\nimport { auth } from './lib/auth';\n\nexport async function middleware(req: NextRequest) {\n  // 1. Check authentication with better-auth\n  const session = await auth.api.getSession({\n    headers: req.headers,\n  });\n  \n  if (!session) {\n    // Not authenticated - redirect to login\n    return NextResponse.redirect(new URL('/login', req.url));\n  }\n  \n  // 2. Extract resource from URL\n  const pathname = req.nextUrl.pathname;\n  \n  // Example: /projects/[id] -> check project permission\n  if (pathname.startsWith('/projects/')) {\n    const projectId = pathname.split('/')[2];\n    \n    // 3. Check permission with Zanzibar plugin\n    const canView = await auth.api.checkPermission({\n      userId: session.user.id,\n      action: 'view',\n      resource: 'project',\n      resourceId: projectId,\n    });\n    \n    if (!canView) {\n      // Authenticated but not authorized\n      return NextResponse.redirect(new URL('/forbidden', req.url));\n    }\n  }\n  \n  // All checks passed\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: [\n    '/projects/:path*',\n    '/folders/:path*',\n    '/dashboard/:path*',\n  ],\n};\n```\n\n## How It Works\n\n1. **Better-Auth** checks if user is logged in\n2. If not logged in → redirect to /login\n3. **Zanzibar Plugin** checks if user has permission on the resource\n4. If no permission → redirect to /forbidden\n5. If all checks pass → allow access\n\n## Benefits\n\n- Centralized protection for all matched routes\n- Works at the edge (Vercel Edge Functions)\n- Fast permission checks\n- Seamless integration between better-auth (who are you) and Zanzibar (what can you do)\n\n## Testing\n\n```bash\n# As owner - can access\nGET /projects/123 → 200 OK\n\n# As viewer - can access\nGET /projects/123 → 200 OK\n\n# As non-member - blocked\nGET /projects/123 → 403 Forbidden\n\n# Not logged in - redirect\nGET /projects/123 → 302 /login\n```",
          },
        ],
        subfolders: [
          {
            name: "Components",
            documents: [
              {
                name: "Permission Gate",
                content:
                  "# Permission Gate Component\n\n```typescript\nfunction PermissionGate({ action, resource, children }) {\n  const { hasPermission } = usePermission(action, resource);\n  if (!hasPermission) return null;\n  return children;\n}\n```",
              },
            ],
            subfolders: [
              {
                name: "UI Components",
                documents: [
                  {
                    name: "Protected Button",
                    content:
                      "# Protected Button Component\n\n## Overview\nA reusable button component that adapts based on better-auth session and Zanzibar permissions.\n\n## Implementation\n```typescript\n'use client';\n\nimport { useSession } from '@/lib/auth-client';\nimport { usePermission } from '@/hooks/use-permission';\n\ninterface ProtectedButtonProps {\n  action: string;\n  resource: string;\n  resourceId: string;\n  onClick: () => void;\n  children: React.ReactNode;\n  fallback?: React.ReactNode;\n}\n\nexport function ProtectedButton({\n  action,\n  resource,\n  resourceId,\n  onClick,\n  children,\n  fallback,\n}: ProtectedButtonProps) {\n  // Get session from better-auth\n  const { data: session, isLoading: sessionLoading } = useSession();\n  \n  // Check permission with Zanzibar plugin\n  const { hasPermission, isLoading: permissionLoading } = usePermission({\n    userId: session?.user?.id,\n    action,\n    resource,\n    resourceId,\n  });\n  \n  const isLoading = sessionLoading || permissionLoading;\n  \n  // Not authenticated - show login prompt or nothing\n  if (!session) {\n    return fallback ? <>{fallback}</> : null;\n  }\n  \n  // No permission - hide button\n  if (!hasPermission && !isLoading) {\n    return fallback ? <>{fallback}</> : null;\n  }\n  \n  return (\n    <button\n      onClick={onClick}\n      disabled={isLoading}\n      className=\"px-4 py-2 bg-blue-600 text-white rounded\"\n    >\n      {isLoading ? 'Loading...' : children}\n    </button>\n  );\n}\n```\n\n## Usage\n```typescript\n'use client';\n\nimport { ProtectedButton } from '@/components/protected-button';\nimport { useDeleteProject } from '@/hooks/projects';\n\nexport function ProjectActions({ projectId }: { projectId: string }) {\n  const deleteProject = useDeleteProject();\n  \n  return (\n    <div className=\"flex gap-2\">\n      {/* Only owners can delete */}\n      <ProtectedButton\n        action=\"delete\"\n        resource=\"project\"\n        resourceId={projectId}\n        onClick={() => deleteProject.mutate({ id: projectId })}\n      >\n        Delete Project\n      </ProtectedButton>\n      \n      {/* Editors and owners can edit */}\n      <ProtectedButton\n        action=\"edit\"\n        resource=\"project\"\n        resourceId={projectId}\n        onClick={() => router.push(`/projects/${projectId}/edit`)}\n      >\n        Edit Project\n      </ProtectedButton>\n    </div>\n  );\n}\n```\n\n## Features\n\n- ✅ Automatically hides if user not authenticated (better-auth)\n- ✅ Automatically hides if user lacks permission (Zanzibar)\n- ✅ Shows loading state during checks\n- ✅ Optional fallback content\n- ✅ Type-safe with TypeScript",
                  },
                ],
              },
              {
                name: "Hooks",
                documents: [
                  {
                    name: "usePermission",
                    content:
                      "# usePermission Hook\n\n```typescript\nfunction usePermission(action: string, resource: string) {\n  return useQuery({\n    queryKey: ['permission', action, resource],\n    queryFn: () => checkPermission({ action, resource }),\n  });\n}\n```",
                  },
                  {
                    name: "useBulkPermissions",
                    content:
                      "# useBulkPermissions Hook\n\nCheck multiple permissions at once for better performance.\n\n```typescript\nconst permissions = useBulkPermissions([\n  { action: 'edit', resource: 'project:1' },\n  { action: 'delete', resource: 'project:1' },\n]);\n```",
                  },
                ],
              },
            ],
          },
          {
            name: "API Routes",
            documents: [
              {
                name: "Protected Routes",
                content:
                  "# Protected API Routes\n\n```typescript\nexport async function GET(req: Request) {\n  const session = await getSession(req);\n  const projectId = req.params.id;\n  \n  const canView = await checkPermission(\n    session.userId,\n    'view',\n    `project:${projectId}`\n  );\n  \n  if (!canView) return new Response('Forbidden', { status: 403 });\n  \n  // Handle request\n}\n```",
              },
            ],
          },
        ],
      },
      {
        name: "Express.js Example",
        documents: [
          {
            name: "Route Protection",
            content:
              "# Protecting Express.js Routes with Better Auth + Zanzibar\n\n## Setup Auth Instance\n```typescript\n// auth.ts\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\nimport { PrismaClient } from '@prisma/client';\n\nconst prisma = new PrismaClient();\n\nexport const auth = betterAuth({\n  database: prisma,\n  emailAndPassword: { enabled: true },\n  plugins: [zanzibar()],\n});\n```\n\n## Create Middleware\n```typescript\n// middleware/auth.ts\nimport { Request, Response, NextFunction } from 'express';\nimport { auth } from '../auth';\n\n// Check authentication\nexport async function requireAuth(\n  req: Request,\n  res: Response,\n  next: NextFunction\n) {\n  const session = await auth.api.getSession({\n    headers: req.headers,\n  });\n  \n  if (!session) {\n    return res.status(401).json({ error: 'Unauthorized' });\n  }\n  \n  req.user = session.user;\n  next();\n}\n\n// Check permission\nexport function requirePermission(\n  resource: string,\n  action: string\n) {\n  return async (\n    req: Request,\n    res: Response,\n    next: NextFunction\n  ) => {\n    const resourceId = req.params.id;\n    \n    const hasPermission = await auth.api.checkPermission({\n      userId: req.user.id,\n      action,\n      resource,\n      resourceId,\n    });\n    \n    if (!hasPermission) {\n      return res.status(403).json({ error: 'Forbidden' });\n    }\n    \n    next();\n  };\n}\n```\n\n## Protect Routes\n```typescript\n// routes/projects.ts\nimport express from 'express';\nimport { requireAuth, requirePermission } from './middleware/auth';\n\nconst router = express.Router();\n\n// View project - requires viewer role or higher\nrouter.get(\n  '/projects/:id',\n  requireAuth,\n  requirePermission('project', 'view'),\n  async (req, res) => {\n    const project = await prisma.project.findUnique({\n      where: { id: req.params.id },\n    });\n    res.json(project);\n  }\n);\n\n// Edit project - requires editor role or higher\nrouter.put(\n  '/projects/:id',\n  requireAuth,\n  requirePermission('project', 'edit'),\n  async (req, res) => {\n    const project = await prisma.project.update({\n      where: { id: req.params.id },\n      data: req.body,\n    });\n    res.json(project);\n  }\n);\n\n// Delete project - requires owner role\nrouter.delete(\n  '/projects/:id',\n  requireAuth,\n  requirePermission('project', 'delete'),\n  async (req, res) => {\n    await prisma.project.delete({\n      where: { id: req.params.id },\n    });\n    res.json({ success: true });\n  }\n);\n\nexport default router;\n```\n\n## Main App\n```typescript\n// app.ts\nimport express from 'express';\nimport { auth } from './auth';\nimport projectRoutes from './routes/projects';\n\nconst app = express();\n\napp.use(express.json());\n\n// Better-auth endpoints\napp.all('/api/auth/*', async (req, res) => {\n  return auth.handler(req);\n});\n\n// Protected routes\napp.use('/api', projectRoutes);\n\napp.listen(3000, () => {\n  console.log('Server running on http://localhost:3000');\n});\n```\n\n## Testing\n\n```bash\n# Not authenticated\ncurl http://localhost:3000/api/projects/123\n→ 401 Unauthorized\n\n# Authenticated but no permission\ncurl -H \"Cookie: session=...\" http://localhost:3000/api/projects/123\n→ 403 Forbidden\n\n# Authenticated with permission\ncurl -H \"Cookie: session=...\" http://localhost:3000/api/projects/123\n→ 200 OK {project data}\n```",
          },
        ],
      },
    ],
  },
  {
    name: "Testing & Quality Assurance",
    ownerEmail: "bob@example.com",
    members: [
      { email: "alice@example.com", role: "editor" },
      { email: "john@example.com", role: "viewer" },
    ],
    folders: [
      {
        name: "Unit Tests",
        documents: [
          {
            name: "Permission Check Tests",
            content:
              "# Permission Check Unit Tests for Better Auth Zanzibar Plugin\n\n## Setup\n```typescript\nimport { betterAuth } from 'better-auth';\nimport { zanzibar } from 'better-auth-zanzibar-plugin';\nimport { PrismaClient } from '@prisma/client';\nimport { beforeEach, describe, it, expect } from 'vitest';\n\nconst prisma = new PrismaClient();\nconst auth = betterAuth({\n  database: prisma,\n  plugins: [\n    zanzibar({\n      schema: {\n        project: {\n          relations: {\n            owner: ['user'],\n            editor: ['user', 'owner'],\n            viewer: ['user', 'editor'],\n          },\n          permissions: {\n            delete: 'owner',\n            edit: 'editor',\n            view: 'viewer',\n          },\n        },\n      },\n    }),\n  ],\n});\n\nbeforeEach(async () => {\n  await prisma.relationTuple.deleteMany();\n});\n```\n\n## Tests\n```typescript\ndescribe('Zanzibar Plugin - Permission Checks', () => {\n  it('grants edit access to project owners', async () => {\n    // Create owner relation\n    await auth.api.addRelation({\n      subjectId: 'user_alice',\n      relation: 'owner',\n      objectType: 'project',\n      objectId: 'project_123',\n    });\n    \n    // Check permission\n    const canEdit = await auth.api.checkPermission({\n      userId: 'user_alice',\n      action: 'edit',\n      resource: 'project',\n      resourceId: 'project_123',\n    });\n    \n    expect(canEdit).toBe(true);\n  });\n  \n  it('grants view access to editors', async () => {\n    await auth.api.addRelation({\n      subjectId: 'user_bob',\n      relation: 'editor',\n      objectType: 'project',\n      objectId: 'project_123',\n    });\n    \n    const canView = await auth.api.checkPermission({\n      userId: 'user_bob',\n      action: 'view',\n      resource: 'project',\n      resourceId: 'project_123',\n    });\n    \n    expect(canView).toBe(true);\n  });\n  \n  it('denies delete access to non-owners', async () => {\n    await auth.api.addRelation({\n      subjectId: 'user_charlie',\n      relation: 'viewer',\n      objectType: 'project',\n      objectId: 'project_123',\n    });\n    \n    const canDelete = await auth.api.checkPermission({\n      userId: 'user_charlie',\n      action: 'delete',\n      resource: 'project',\n      resourceId: 'project_123',\n    });\n    \n    expect(canDelete).toBe(false);\n  });\n  \n  it('denies access to users with no relation', async () => {\n    const canView = await auth.api.checkPermission({\n      userId: 'user_unknown',\n      action: 'view',\n      resource: 'project',\n      resourceId: 'project_123',\n    });\n    \n    expect(canView).toBe(false);\n  });\n});\n```\n\n## Run Tests\n```bash\nnpm test\n```",
          },
          {
            name: "Tuple Management Tests",
            content:
              "# Tuple CRUD Tests\n\n```typescript\ndescribe('Tuple Management', () => {\n  it('creates and retrieves tuples', async () => {\n    await addRelation('folder:1', 'viewer', 'user:bob');\n    const tuples = await expandRelation('folder:1', 'viewer');\n    expect(tuples).toContain('user:bob');\n  });\n});\n```",
          },
        ],
        subfolders: [
          {
            name: "Integration Tests",
            documents: [
              {
                name: "End-to-End Scenarios",
                content:
                  "# E2E Test Scenarios\n\n## Scenario 1: Project Collaboration\n1. User creates project\n2. User adds collaborator\n3. Collaborator creates folder\n4. Original user can view folder\n\n## Scenario 2: Permission Inheritance\n1. Set project-level permission\n2. Create nested folders\n3. Verify permission cascades down",
              },
            ],
            subfolders: [
              {
                name: "User Workflows",
                documents: [
                  {
                    name: "Onboarding Flow",
                    content:
                      "# E2E Test: User Onboarding with Better Auth + Zanzibar\n\n## Test Scenario\nComplete flow from signup to collaborative project access.\n\n```typescript\nimport { test, expect } from '@playwright/test';\nimport { auth } from '../lib/auth';\n\ntest.describe('User Onboarding Flow', () => {\n  test('new user can signup, create project, and invite team member', async ({ page, context }) => {\n    // Step 1: Sign up with better-auth\n    await page.goto('/signup');\n    await page.fill('input[name=\"email\"]', 'alice@example.com');\n    await page.fill('input[name=\"password\"]', 'securePassword123');\n    await page.fill('input[name=\"name\"]', 'Alice');\n    await page.click('button[type=\"submit\"]');\n    \n    // Should redirect to dashboard\n    await expect(page).toHaveURL('/dashboard');\n    \n    // Step 2: Create first project\n    await page.click('text=New Project');\n    await page.fill('input[name=\"name\"]', 'My First Project');\n    await page.click('button:has-text(\"Create\")');\n    \n    // Should navigate to project page\n    await expect(page).toHaveURL(/\\/projects\\/\\w+/);\n    \n    // Extract project ID from URL\n    const projectId = page.url().split('/').pop();\n    \n    // Step 3: Invite team member\n    await page.click('text=Add Member');\n    await page.fill('input[name=\"email\"]', 'bob@example.com');\n    await page.selectOption('select[name=\"role\"]', 'editor');\n    await page.click('button:has-text(\"Invite\")');\n    \n    // Should show success message\n    await expect(page.locator('text=Member added successfully')).toBeVisible();\n    \n    // Step 4: Open new browser context as Bob\n    const bobPage = await context.newPage();\n    \n    // Bob signs up\n    await bobPage.goto('/signup');\n    await bobPage.fill('input[name=\"email\"]', 'bob@example.com');\n    await bobPage.fill('input[name=\"password\"]', 'bobPassword123');\n    await bobPage.fill('input[name=\"name\"]', 'Bob');\n    await bobPage.click('button[type=\"submit\"]');\n    \n    // Bob should see the project in his dashboard\n    await bobPage.goto('/dashboard');\n    await expect(bobPage.locator('text=My First Project')).toBeVisible();\n    \n    // Step 5: Verify permissions\n    await bobPage.goto(`/projects/${projectId}`);\n    \n    // Bob (editor) should see edit button\n    await expect(bobPage.locator('button:has-text(\"Edit\")')).toBeVisible();\n    \n    // Bob (editor) should NOT see delete button (owner only)\n    await expect(bobPage.locator('button:has-text(\"Delete\")')).not.toBeVisible();\n    \n    // Alice (owner) should see delete button\n    await page.goto(`/projects/${projectId}`);\n    await expect(page.locator('button:has-text(\"Delete\")')).toBeVisible();\n  });\n});\n```\n\n## What This Tests\n\n- ✅ Better-auth signup flow\n- ✅ Better-auth session management\n- ✅ Zanzibar permission creation (project owner)\n- ✅ Adding team members with roles\n- ✅ Permission-based UI rendering\n- ✅ Role hierarchy (owner > editor)",
                  },
                  {
                    name: "Permission Transfer",
                    content:
                      "# Permission Transfer Test\n\n1. Owner creates project\n2. Owner adds editor\n3. Editor creates resources\n4. Owner transfers ownership\n5. New owner has full access\n6. Previous owner becomes editor",
                  },
                ],
              },
              {
                name: "Edge Cases",
                documents: [
                  {
                    name: "Circular Dependencies",
                    content:
                      "# Circular Dependency Test\n\nEnsure the system handles circular relations gracefully without infinite loops.",
                  },
                  {
                    name: "Orphaned Resources",
                    content:
                      "# Orphaned Resource Test\n\nVerify behavior when parent resources are deleted and cascade logic applies.",
                  },
                ],
              },
            ],
          },
          {
            name: "Performance Tests",
            documents: [
              {
                name: "Load Testing",
                content:
                  "# Performance Benchmarks\n\n## Target Metrics\n- 1000+ permission checks/second\n- <5ms p95 latency\n- Supports 100k+ tuples\n\n## Test Results\n- Simple check: 0.8ms avg\n- Recursive check: 2.3ms avg\n- Complex hierarchy: 4.1ms avg",
              },
            ],
            subfolders: [
              {
                name: "Stress Tests",
                documents: [
                  {
                    name: "High Concurrency",
                    content:
                      "# High Concurrency Test\n\nSimulate 1000 concurrent users performing permission checks.\n\n## Results\n- 99th percentile: 12ms\n- No errors under load\n- Cache hit rate: 87%",
                  },
                ],
                subfolders: [
                  {
                    name: "Database Load",
                    documents: [
                      {
                        name: "Query Performance",
                        content:
                          "# Query Performance Analysis\n\n## Most Common Queries\n1. Direct relation lookup: 0.5ms\n2. Recursive expansion: 2.1ms\n3. Multi-hop inheritance: 4.3ms\n\n## Optimization Opportunities\n- Add composite indexes\n- Implement query result caching",
                      },
                    ],
                  },
                ],
              },
              {
                name: "Scalability Tests",
                documents: [
                  {
                    name: "Large Dataset",
                    content:
                      "# Large Dataset Test\n\nTest with 1M tuples and 100K users.\n\n## Results\n- Permission check latency remains stable\n- Index performance is critical\n- Memory usage scales linearly",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Test Data",
        documents: [
          {
            name: "Sample Schemas",
            content:
              "# Test Schemas\n\n## Document Management Schema\n```yaml\nnamespaces:\n  project:\n    relations:\n      owner: [user]\n      editor: [user, owner]\n      viewer: [user, editor]\n  folder:\n    relations:\n      parent: [project, folder]\n      owner: [user, parent.owner]\n      editor: [user, parent.editor]\n      viewer: [user, parent.viewer]\n```",
          },
        ],
      },
    ],
  },
];
