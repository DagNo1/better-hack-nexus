import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function deleteDirectory(targetPath: string) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`Deleted ${targetPath}`);
  } else {
    console.log(`Not found: ${targetPath}`);
  }
}

function hasExistingMigrations(root: string): boolean {
  const dir = path.resolve(root, "prisma", "schema", "migrations");
  if (!fs.existsSync(dir)) return false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.some((e) => e.isDirectory());
}

function run(cmd: string) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  const cwd = process.cwd();
  const migrationsPath = path.resolve(cwd, "prisma", "schema", "migrations");

  // 1) Delete migrations folder
  deleteDirectory(migrationsPath);

  // 2) Reset database
  run("prisma migrate reset --force --schema ./prisma/schema");

  // 3) Migrate (auto-name first as init)
  const migrateCmd = hasExistingMigrations(cwd)
    ? "prisma migrate dev --schema ./prisma/schema"
    : "prisma migrate dev --schema ./prisma/schema --name init";
  run(migrateCmd);
}

try {
  main();
} catch (err) {
  process.exit((err as any)?.status ?? 1);
}
