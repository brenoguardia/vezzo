import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/shared/categories";

const prisma = new PrismaClient();

// Idempotente: pode rodar várias vezes (upsert por slug).
async function main() {
  for (const { templates, ...category } of CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    for (const template of templates) {
      await prisma.habitTemplate.upsert({
        where: { slug: template.slug },
        update: { ...template, categoryId: saved.id },
        create: { ...template, categoryId: saved.id },
      });
    }
  }
  const total = CATEGORIES.reduce((n, c) => n + c.templates.length, 0);
  console.log(`Seed ok: ${CATEGORIES.length} categorias, ${total} atividades.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
