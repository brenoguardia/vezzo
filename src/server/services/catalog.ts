import type { Db } from "@/server/db";
import type { CatalogDto } from "@/shared/schemas";

export async function getCatalog(db: Db): Promise<CatalogDto> {
  const [categories, templates] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.habitTemplate.findMany({ orderBy: { order: "asc" } }),
  ]);
  return {
    categories: categories.map((c) => ({
      slug: c.slug,
      namePt: c.namePt,
      nameEn: c.nameEn,
      order: c.order,
      templates: templates
        .filter((t) => t.categoryId === c.id)
        .map((t) => ({
          slug: t.slug,
          namePt: t.namePt,
          nameEn: t.nameEn,
          emoji: t.emoji,
          defaultGoalValue: t.defaultGoalValue,
          goalUnit: t.goalUnit,
          defaultDays: t.defaultDays,
          order: t.order,
        })),
    })),
  };
}
