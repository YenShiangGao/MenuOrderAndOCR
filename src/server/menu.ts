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

// ============ Menu Item ============
const itemSchema = z.object({
  name: z.string().min(1, "品名不可空白").max(50, "品名最多 50 字").trim(),
  description: z.string().max(200, "描述最多 200 字").trim().optional(),
  price: z
    .number()
    .int("價格只能是整數")
    .min(0, "價格不可為負")
    .max(99999, "價格過大"),
  categoryId: z.string().min(1, "請選擇分類"),
});

const createItemSchema = itemSchema;
const updateItemSchema = itemSchema.partial().extend({
  id: z.string().min(1),
  isAvailable: z.boolean().optional(),
});

export async function createItemAction(
  input: z.input<typeof createItemSchema>,
): Promise<ActionResult> {
  await requireAuth();
  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }

  const max = await prisma.menuItem.findFirst({
    where: { categoryId: parsed.data.categoryId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.menuItem.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      sortOrder: (max?.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/admin/menu/items");
  return { ok: true };
}

export async function updateItemAction(
  input: z.input<typeof updateItemSchema>,
): Promise<ActionResult> {
  await requireAuth();
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }

  const { id, ...rest } = parsed.data;
  await prisma.menuItem.update({
    where: { id },
    data: {
      ...(rest.name !== undefined && { name: rest.name }),
      ...(rest.description !== undefined && { description: rest.description }),
      ...(rest.price !== undefined && { price: rest.price }),
      ...(rest.categoryId !== undefined && { categoryId: rest.categoryId }),
      ...(rest.isAvailable !== undefined && { isAvailable: rest.isAvailable }),
    },
  });
  revalidatePath("/admin/menu/items");
  return { ok: true };
}

export async function deleteItemAction(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menu/items");
  return { ok: true };
}

export async function toggleSoldOutAction(
  id: string,
): Promise<ActionResult> {
  await requireAuth();
  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: { soldOutAt: true },
  });
  if (!item) return { ok: false, error: "找不到菜品" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isSoldOutToday =
    item.soldOutAt !== null && item.soldOutAt >= today;

  await prisma.menuItem.update({
    where: { id },
    data: { soldOutAt: isSoldOutToday ? null : new Date() },
  });
  revalidatePath("/admin/menu/items");
  return { ok: true };
}
