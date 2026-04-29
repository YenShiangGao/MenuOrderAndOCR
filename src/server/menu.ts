"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deleteMenuImage, uploadMenuImage } from "./storage";

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
const itemFieldsSchema = z.object({
  name: z.string().min(1, "品名不可空白").max(50, "品名最多 50 字").trim(),
  description: z.string().max(200, "描述最多 200 字").trim().optional(),
  price: z
    .number()
    .int("價格只能是整數")
    .min(0, "價格不可為負")
    .max(99999, "價格過大"),
  categoryId: z.string().min(1, "請選擇分類"),
});

function parseItemFields(formData: FormData) {
  const description = (formData.get("description") as string | null)?.trim();
  return itemFieldsSchema.safeParse({
    name: formData.get("name"),
    description: description ? description : undefined,
    price: Number(formData.get("price")),
    categoryId: formData.get("categoryId"),
  });
}

function getOptionalFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) return value;
  return null;
}

export async function createItemAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const parsed = parseItemFields(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }

  let imageUrl: string | null = null;
  const imageFile = getOptionalFile(formData, "image");
  if (imageFile) {
    const upload = await uploadMenuImage(imageFile);
    if (!upload.ok) return { ok: false, error: upload.error };
    imageUrl = upload.url;
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
      imageUrl,
      sortOrder: (max?.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/admin/menu/items");
  revalidatePath("/menu");
  return { ok: true };
}

export async function updateItemAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { ok: false, error: "缺少 id" };
  }

  const parsed = parseItemFields(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }

  const isAvailableRaw = formData.get("isAvailable");
  const isAvailable =
    isAvailableRaw === "true" || isAvailableRaw === "false"
      ? isAvailableRaw === "true"
      : undefined;

  const removeImage = formData.get("removeImage") === "true";
  const imageFile = getOptionalFile(formData, "image");

  const existing = await prisma.menuItem.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  if (!existing) return { ok: false, error: "找不到菜品" };

  let imageUrlPatch: { imageUrl: string | null } | undefined;
  let oldImageToDelete: string | null = null;

  if (imageFile) {
    const upload = await uploadMenuImage(imageFile);
    if (!upload.ok) return { ok: false, error: upload.error };
    imageUrlPatch = { imageUrl: upload.url };
    oldImageToDelete = existing.imageUrl;
  } else if (removeImage) {
    imageUrlPatch = { imageUrl: null };
    oldImageToDelete = existing.imageUrl;
  }

  await prisma.menuItem.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      ...(isAvailable !== undefined && { isAvailable }),
      ...(imageUrlPatch ?? {}),
    },
  });

  if (oldImageToDelete) {
    await deleteMenuImage(oldImageToDelete);
  }

  revalidatePath("/admin/menu/items");
  revalidatePath("/menu");
  return { ok: true };
}

export async function toggleItemAvailableAction(
  id: string,
): Promise<ActionResult> {
  await requireAuth();
  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: { isAvailable: true },
  });
  if (!item) return { ok: false, error: "找不到菜品" };
  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable: !item.isAvailable },
  });
  revalidatePath("/admin/menu/items");
  revalidatePath("/menu");
  return { ok: true };
}

export async function deleteItemAction(id: string): Promise<ActionResult> {
  await requireAuth();
  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  await prisma.menuItem.delete({ where: { id } });
  if (item?.imageUrl) {
    await deleteMenuImage(item.imageUrl);
  }
  revalidatePath("/admin/menu/items");
  revalidatePath("/menu");
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
  revalidatePath("/menu");
  return { ok: true };
}
