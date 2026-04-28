import { prisma } from "@/lib/prisma";
import { ItemTable, type ItemRow } from "@/components/admin/item-table";

export default async function ItemsPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({
      orderBy: [
        { category: { sortOrder: "asc" } },
        { sortOrder: "asc" },
      ],
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: ItemRow[] = items.map((it) => ({
    id: it.id,
    name: it.name,
    description: it.description,
    price: it.price,
    isAvailable: it.isAvailable,
    isSoldOutToday: it.soldOutAt !== null && it.soldOutAt >= startOfToday,
    category: { id: it.category.id, name: it.category.name },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">菜品</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理所有菜品。「下架」會永久從前台菜單隱藏;「售完」每天 0 點自動恢復。
        </p>
      </div>
      <ItemTable items={rows} categories={categories} />
    </div>
  );
}
