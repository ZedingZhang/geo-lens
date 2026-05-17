import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding GEO Lens sample projects...");

  await prisma.project.deleteMany({ where: { isSample: true } });

  const project1 = await prisma.project.create({
    data: {
      name: "CloudDeploy — DevOps Platform GEO Audit",
      brandName: "CloudDeploy",
      websiteUrl: "https://clouddeploy.example.com",
      description:
        "CloudDeploy is a continuous deployment platform that helps engineering teams ship code faster with zero-downtime deployments, automated rollbacks, and multi-cloud support.",
      audience: "DevOps engineers, platform teams, CTOs at mid-size SaaS companies",
      product: "CloudDeploy CI/CD Platform",
      keywords: JSON.stringify([
        "CI/CD platform",
        "zero-downtime deployment",
        "multi-cloud deployment",
        "DevOps automation",
        "continuous delivery",
      ]),
      competitors: JSON.stringify(["Harness", "Spinnaker", "Octopus Deploy"]),
      isSample: true,
    },
  });

  await prisma.analysis.create({
    data: {
      projectId: project1.id,
      totalScore: 62,
      entityClarity: 55,
      answerCoverage: 68,
      citationReadiness: 48,
      contentStructure: 72,
      freshnessSignal: 67,
      strengths: JSON.stringify([
        "Clear product description with target audience identified",
        "Well-structured documentation pages",
        "Active blog with regular content updates",
      ]),
      weaknesses: JSON.stringify([
        "Brand entity definition is vague",
        "Missing citable facts and statistics",
        "No comparison context against competitors",
        "No structured data (JSON-LD)",
        "Limited FAQ content",
      ]),
      nextActions: JSON.stringify([
        "Add clear entity definition to homepage",
        "Create FAQ section with 8-10 questions",
        "Add JSON-LD Organization and FAQPage schema",
        "Inject citable facts with numbers",
        "Add comparison context with competitors",
      ]),
      resultSource: "mock",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Sarah Chen — UX Consultant GEO Audit",
      brandName: "Sarah Chen UX",
      websiteUrl: "https://sarachenux.example.com",
      description:
        "Sarah Chen is a UX research consultant specializing in enterprise SaaS products. She helps product teams conduct user research, usability testing, and design system audits.",
      audience: "Product managers, UX leads, startup founders",
      product: "UX Research & Consulting Services",
      keywords: JSON.stringify([
        "UX research consultant",
        "enterprise UX audit",
        "usability testing",
        "design system",
        "SaaS UX",
      ]),
      competitors: JSON.stringify(["Nielsen Norman Group", "User Interviews"]),
      isSample: true,
    },
  });

  await prisma.analysis.create({
    data: {
      projectId: project2.id,
      totalScore: 71,
      entityClarity: 75,
      answerCoverage: 65,
      citationReadiness: 60,
      contentStructure: 78,
      freshnessSignal: 77,
      strengths: JSON.stringify([
        "Clear personal brand positioning",
        "Well-structured portfolio with case studies",
        "Regularly updated blog with thought leadership content",
      ]),
      weaknesses: JSON.stringify([
        "Limited comparison context vs. established firms",
        "No FAQ section addressing common UX consulting questions",
        "Missing structured data markup",
      ]),
      nextActions: JSON.stringify([
        "Add FAQ section on UX consulting ROI",
        "Add JSON-LD Person schema",
        "Create comparison content vs. traditional agencies",
      ]),
      resultSource: "mock",
    },
  });

  await prisma.project.create({
    data: {
      name: "FinFlow — Fintech App GEO Audit",
      brandName: "FinFlow",
      websiteUrl: "https://finflow.example.com",
      description:
        "FinFlow is a personal finance management app that uses AI to categorize expenses, predict cash flow, and provide personalized saving recommendations.",
      audience: "Millennials and Gen Z managing personal finances",
      product: "FinFlow AI-Powered Finance App",
      keywords: JSON.stringify([
        "personal finance app",
        "AI budgeting",
        "expense tracking",
        "saving recommendations",
      ]),
      competitors: JSON.stringify(["Mint", "YNAB", "Copilot"]),
      isSample: true,
    },
  });

  await prisma.project.create({
    data: {
      name: "GreenByte — Sustainable Tech Blog GEO Audit",
      brandName: "GreenByte",
      websiteUrl: "https://greenbyte.example.com",
      description:
        "GreenByte is a blog and newsletter covering sustainable technology, green software engineering, and climate tech investments.",
      audience: "Software engineers, climate tech investors, sustainability managers",
      product: "GreenByte Newsletter & Analysis Reports",
      keywords: JSON.stringify([
        "sustainable technology",
        "green software",
        "climate tech",
        "carbon-aware computing",
      ]),
      competitors: JSON.stringify(["CTVC", "Sightline Climate"]),
      isSample: true,
    },
  });

  console.log("Seeding complete! Created 4 sample projects.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
