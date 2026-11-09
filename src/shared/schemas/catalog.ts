import { z } from "zod";
import { goalUnit } from "./common";

export const catalogDto = z.object({
  categories: z.array(
    z.object({
      slug: z.string(),
      namePt: z.string(),
      nameEn: z.string(),
      order: z.number(),
      templates: z.array(
        z.object({
          slug: z.string(),
          namePt: z.string(),
          nameEn: z.string(),
          emoji: z.string(),
          defaultGoalValue: z.number(),
          goalUnit,
          defaultDays: z.array(z.number()),
          order: z.number(),
        }),
      ),
    }),
  ),
});
export type CatalogDto = z.infer<typeof catalogDto>;
