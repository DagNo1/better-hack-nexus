import "dotenv/config";
import prisma from "@/db";
import { auth } from "@/lib/auth/auth";
import logger from "@/lib/logger";

const SAMPLE_USERS = [
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

const SAMPLE_PROJECTS = [
  {
    name: "Website Redesign",
    ownerEmail: "john@example.com",
    members: [
      { email: "jane@example.com", role: "editor" },
      { email: "bob@example.com", role: "viewer" },
    ],
    folders: [
      {
        name: "Design Assets",
        documents: [
          {
            name: "Brand Guidelines",
            content:
              "# Brand Guidelines\n\nOur brand colors, fonts, and style guide.",
          },
          {
            name: "Wireframes",
            content:
              "# Wireframes\n\nInitial wireframe sketches for the new website.",
          },
        ],
        subfolders: [
          {
            name: "Images",
            documents: [
              {
                name: "Logo Variations",
                content: "# Logo Variations\n\nDifferent versions of our logo.",
              },
            ],
          },
        ],
      },
      {
        name: "Development",
        documents: [
          {
            name: "API Documentation",
            content: "# API Documentation\n\nEndpoints and usage examples.",
          },
          {
            name: "Setup Instructions",
            content:
              "# Setup Instructions\n\n1. Clone the repo\n2. Install dependencies\n3. Run dev server",
          },
        ],
      },
    ],
  },
  {
    name: "Marketing Campaign",
    ownerEmail: "jane@example.com",
    members: [
      { email: "john@example.com", role: "editor" },
      { email: "alice@example.com", role: "viewer" },
    ],
    folders: [
      {
        name: "Content",
        documents: [
          {
            name: "Blog Posts",
            content:
              "# Blog Posts\n\n## Post 1: Introduction\n\nWelcome to our new campaign!",
          },
          {
            name: "Social Media",
            content:
              "# Social Media Content\n\nScheduled posts for Twitter, LinkedIn, and Facebook.",
          },
        ],
      },
      {
        name: "Analytics",
        documents: [
          {
            name: "Q1 Report",
            content:
              "# Q1 Analytics Report\n\nKey metrics and insights from Q1.",
          },
        ],
      },
    ],
  },
  {
    name: "Internal Tools",
    ownerEmail: "admin@example.com",
    members: [
      { email: "john@example.com", role: "editor" },
      { email: "jane@example.com", role: "editor" },
      { email: "bob@example.com", role: "editor" },
      { email: "alice@example.com", role: "viewer" },
    ],
    folders: [
      {
        name: "Scripts",
        documents: [
          {
            name: "Database Backup",
            content:
              "#!/bin/bash\n\n# Backup database script\npg_dump mydb > backup.sql",
          },
          {
            name: "Deploy Script",
            content:
              "#!/bin/bash\n\n# Deploy to production\nnpm run build\nnpm run deploy",
          },
        ],
        subfolders: [
          {
            name: "Automation",
            documents: [
              {
                name: "Cron Jobs",
                content: "# Cron Jobs\n\nScheduled tasks for maintenance.",
              },
            ],
          },
        ],
      },
      {
        name: "Documentation",
        documents: [
          {
            name: "Onboarding Guide",
            content: "# Onboarding Guide\n\nWelcome new team members!",
          },
        ],
      },
    ],
  },
  {
    name: "Research Project",
    ownerEmail: "bob@example.com",
    members: [{ email: "alice@example.com", role: "editor" }],
    folders: [
      {
        name: "Papers",
        documents: [
          {
            name: "Literature Review",
            content:
              "# Literature Review\n\nSummary of existing research in the field.",
          },
          {
            name: "Methodology",
            content: "# Research Methodology\n\nOur approach and methods.",
          },
        ],
        subfolders: [
          {
            name: "Drafts",
            documents: [
              {
                name: "Draft v1",
                content:
                  "# Draft Version 1\n\nFirst draft of the research paper.",
              },
              {
                name: "Draft v2",
                content: "# Draft Version 2\n\nSecond draft with revisions.",
              },
            ],
          },
          {
            name: "Published",
            documents: [
              {
                name: "Final Paper",
                content:
                  "# Final Published Paper\n\nThe final version submitted for publication.",
              },
            ],
          },
        ],
      },
      {
        name: "Data",
        documents: [
          {
            name: "Raw Data",
            content: "# Raw Data\n\nOriginal data collected from experiments.",
          },
        ],
        subfolders: [
          {
            name: "Analysis",
            documents: [
              {
                name: "Statistical Analysis",
                content:
                  "# Statistical Analysis\n\nResults of statistical tests.",
              },
            ],
          },
        ],
      },
    ],
  },
];

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
      projectId,
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
