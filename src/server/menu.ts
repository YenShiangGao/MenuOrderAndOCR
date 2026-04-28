"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Unauthorized");
  }
  return session;
}

// ============ Category ============
const categoryNameSchema = z.string().min(1, "名稱不可空白").max(30, "名稱最多 30 字").trim();

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategoryAction(name: string): Promise<ActionResult> {
  await requireAuth();
  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "名稱無效" };
  }

  const max = await prisma.menuCategory.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.menuCategory.create({
    data: {
      name: parsed.data,
      sortOrder: (max?.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/admin/menu/categories");
  return { ok: true };
}

const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: categoryNameSchema.optional(),
  isActive: z.boolean().optional(),
});

export async function updateCategoryAction(
  input: z.input<typeof updateCategorySchema>,
): Promise<ActionResult> {
  await requireAuth();
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }

  await prisma.menuCategory.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
    },
  });
  revalidatePath("/admin/menu/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAuth();

  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    return {
      ok: false,
      error: `此分類底下還有 ${itemCount} 道菜品,請先刪除或移動菜品`,
    };
  }

  await prisma.menuCategory.delete({ where: { id } });
  revalidatePath("/admin/menu/categories");
  return { ok: true };
}

export async function reorderCategoriesAction(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAuth();
  if (orderedIds.length === 0) return { ok: true };

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.menuCategory.update({
        where: { id },
        data: { sortOrder: idx + 1 },
      }),
    ),
  );
  revalidatePath("/admin/menu/categories");
  return { ok: true };
}
