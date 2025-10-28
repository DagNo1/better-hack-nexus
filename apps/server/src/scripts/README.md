# Database Scripts

This directory contains utility scripts for managing the database.

## Available Scripts

### Seed Script (`seed.ts`)

Seeds the database with sample data for development and testing.

**Usage:**

```bash
# Seed the database (skips if data already exists)
npm run db:seed
# or
pnpm db:seed

# Force reseed (deletes existing data)
npm run db:seed -- --force
# or
pnpm db:seed -- --force
```

**What it creates:**

1. **5 Sample Users (Email is password):**
   - Admin User (admin@example.com) - Admin role
   - John Doe (john@example.com)
   - Jane Smith (jane@example.com)
   - Bob Wilson (bob@example.com)
   - Alice Johnson (alice@example.com)

2. **4 Sample Projects:**
   - Website Redesign (owned by John)
   - Marketing Campaign (owned by Jane)
   - Internal Tools (owned by Admin)
   - Research Project (owned by Bob)

3. **Project Members** with different roles (owner, editor, viewer)

4. **Folders** with nested subfolder structures

5. **Documents** with sample content in each folder

**⚠️ Warning:**

- By default, the seeder will **skip** if data already exists in the database.
- Using the `--force` flag will **delete all existing data** before seeding.
- Use with caution in production environments.

### Clean Start Script (`start-clean.ts`)

Resets the database and starts fresh.

**Usage:**

```bash
npm run db:start-clean
# or
pnpm db:start-clean
```

## Development Workflow

For a fresh development environment:

```bash
# 1. Run migrations
pnpm db:migrate

# 2. Generate Prisma client
pnpm db:generate

# 3. Seed the database
pnpm db:seed

# 4. Start the development server
pnpm dev
```

## Sample Login Credentials

After seeding, you can use these credentials to log in:

| Email             | Password          | Role  |
| ----------------- | ----------------- | ----- |
| admin@example.com | admin@example.com | admin |
| john@example.com  | john@example.com  | user  |
| jane@example.com  | jane@example.com  | user  |
| bob@example.com   | bob@example.com   | user  |
| alice@example.com | alice@example.com | user  |

💡 **Note:** For simplicity, the password is the same as the email address for all users.

## Customizing Seed Data

To customize the seed data, edit the constants at the top of `seed.ts`:

- `SAMPLE_USERS`: Add or modify user data
- `SAMPLE_PROJECTS`: Add or modify projects, folders, and documents

The seeder will automatically create all related entities and maintain proper relationships.
