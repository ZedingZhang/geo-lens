import prisma from "@/lib/db";

export async function cleanupExpiredDemoData(): Promise<{
  deletedProjects: number;
  deletedAnalyses: number;
  deletedQuestions: number;
}> {
  const now = new Date();

  const expiredProjects = await prisma.project.findMany({
    where: {
      isSample: false,
      expiresAt: { lt: now },
    },
    select: { id: true },
  });

  const projectIds = expiredProjects.map((p) => p.id);

  if (projectIds.length === 0) {
    return { deletedProjects: 0, deletedAnalyses: 0, deletedQuestions: 0 };
  }

  await prisma.project.deleteMany({
    where: { id: { in: projectIds } },
  });

  return {
    deletedProjects: projectIds.length,
    deletedAnalyses: 0,
    deletedQuestions: 0,
  };
}
