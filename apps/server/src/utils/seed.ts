import "dotenv/config";
import prisma from "@/db";
import { auth } from "@/lib/auth/auth";
import logger from "@/lib/logger";
import { SAMPLE_USERS, SAMPLE_PROJECTS } from "./seed-data";

async function createUser(userData: (typeof SAMPLE_USERS)[0]) {
  try {
    logger.info(`Creating user: ${userData.name} (${userData.email})`);

    const userResponse = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      },
    });

    if (!userResponse?.user) {
      throw new Error(`Failed to create user: ${userData.email}`);
    }

    // Update user with additional fields
    const user = await prisma.user.update({
      where: { id: userResponse.user.id },
      data: {
        role: userData.role,
        emailVerified: userData.emailVerified,
      },
    });

    console.log(`✓ Created user: ${user.name} (${user.email})`);
    return user;
  } catch (error: any) {
    logger.error(
      `Error creating user ${userData.name} (${userData.email}):`,
      error
    );
    throw error;
  }
}

async function createFolder(
  projectId: string,
  folderData: any,
  parentId?: string
) {
  const folder = await prisma.folder.create({
    data: {
      name: folderData.name,
      // Only set projectId if this is a top-level folder (no parentId)
      projectId: parentId ? null : projectId,
      parentId,
    },
  });

  console.log(`  ✓ Created folder: ${folder.name}`);

  // Create files in this folder
  if (folderData.documents) {
    for (const docData of folderData.documents) {
      const file = await prisma.file.create({
        data: {
          name: docData.name,
          content: docData.content,
          folderId: folder.id,
        },
      });
      console.log(`    ✓ Created file: ${file.name}`);
    }
  }

  // Create subfolders recursively
  if (folderData.subfolders) {
    for (const subfolderData of folderData.subfolders) {
      await createFolder(projectId, subfolderData, folder.id);
    }
  }

  return folder;
}

async function createProject(
  projectData: (typeof SAMPLE_PROJECTS)[0],
  users: Map<string, string>
) {
  const ownerId = users.get(projectData.ownerEmail);
  if (!ownerId) {
    throw new Error(`Owner not found: ${projectData.ownerEmail}`);
  }

  const project = await prisma.project.create({
    data: {
      name: projectData.name,
      ownerId,
    },
  });

  console.log(`✓ Created project: ${project.name}`);

  // Add owner as project member with owner role
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: ownerId,
      role: "owner",
    },
  });
  console.log(`  ✓ Added owner: ${projectData.ownerEmail} as owner`);

  // Create project members
  for (const memberData of projectData.members) {
    const userId = users.get(memberData.email);
    if (userId) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: memberData.role,
        },
      });
      console.log(
        `  ✓ Added member: ${memberData.email} as ${memberData.role}`
      );
    }
  }

  // Create folders and their contents
  if (projectData.folders) {
    for (const folderData of projectData.folders) {
      await createFolder(project.id, folderData);
    }
  }

  return project;
}

export async function seedDatabase(forceReseed = false) {
  logger.info("🌱 Starting database seeding...\n");

  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    const existingProjects = await prisma.project.count();

    if (existingUsers > 0 || existingProjects > 0) {
      if (forceReseed) {
        logger.info(
          `Found ${existingUsers} users and ${existingProjects} projects. Force flag detected, proceeding with cleanup...`
        );
      } else {
        logger.info(
          `Found ${existingUsers} users and ${existingProjects} projects already seeded. Skipping seed.`
        );
        return;
      }
    }

    // Clear existing data (in reverse order of dependencies)
    if (forceReseed || existingUsers > 0 || existingProjects > 0) {
      logger.info("🧹 Cleaning up existing data...");
      await prisma.file.deleteMany();
      await prisma.folder.deleteMany();
      await prisma.projectMember.deleteMany();
      await prisma.project.deleteMany();
      await prisma.session.deleteMany();
      await prisma.account.deleteMany();
      await prisma.verification.deleteMany();
      await prisma.user.deleteMany();
      logger.info("✓ Cleaned up existing data\n");
    }

    // Create users
    logger.info("👥 Creating users...");
    const userMap = new Map<string, string>();
    for (const userData of SAMPLE_USERS) {
      const user = await createUser(userData);
      userMap.set(user.email, user.id);
    }
    console.log("");

    // Create projects with folders and documents
    logger.info("📁 Creating projects...");
    for (const projectData of SAMPLE_PROJECTS) {
      await createProject(projectData, userMap);
      console.log("");
    }

    logger.info("✅ Database seeding completed successfully!");
    logger.info(
      `Created ${SAMPLE_USERS.length} users and ${SAMPLE_PROJECTS.length} projects`
    );
    console.log("\n📝 Sample login credentials:");
    console.log("   Admin:  admin@example.com / admin@example.com");
    console.log("   User 1: john@example.com / john@example.com");
    console.log("   User 2: jane@example.com / jane@example.com");
    console.log("   User 3: bob@example.com / bob@example.com");
    console.log("   User 4: alice@example.com / alice@example.com");
    console.log("\n   💡 Tip: Password is the same as the email for all users");
  } catch (error) {
    logger.error(
      "❌ Error seeding database:",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// Run seed when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const forceReseed = process.argv.includes("--force");
  seedDatabase(forceReseed)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
