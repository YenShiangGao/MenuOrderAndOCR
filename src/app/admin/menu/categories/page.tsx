import { prisma } from "@/lib/prisma";
import {
  CategoryTable,
  type CategoryRow,
} from "@/components/admin/category-table";

export default async function CategoriesPage() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    itemCount: c._count.items,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">菜單分類</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          分類用於菜單分組顯示。停用的分類不會出現在前台菜單,但既有菜品仍會保留。
        </p>
      </div>
      <CategoryTable categories={rows} />
    </div>
  );
}
