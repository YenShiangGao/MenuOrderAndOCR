import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "菜單",
};

export const revalidate = 60; // ISR: 後台改完最多 60 秒生效

function formatPrice(p: number) {
  return `$${p.toLocaleString()}`;
}

export default async function MenuPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // 過濾掉沒有任何菜品的分類
  const visibleCategories = categories.filter((c) => c.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">菜單</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          所有菜品供應狀況以實際店內為主
        </p>
      </header>

      {visibleCategories.length === 0 ? (
        <p className="text-center text-muted-foreground">
          菜單尚未建立,請稍候
        </p>
      ) : (
        <div className="space-y-12">
          {visibleCategories.map((cat) => (
            <section key={cat.id}>
              <h2 className="mb-6 border-b pb-2 text-xl font-semibold">
                {cat.name}
              </h2>
              <ul className="space-y-4">
                {cat.items.map((item) => {
                  const isSoldOut =
                    item.soldOutAt !== null && item.soldOutAt >= startOfToday;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-4 border-b pb-4 last:border-b-0"
                    >
                      {item.imageUrl && (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-md sm:size-20">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 64px, 80px"
                            className={
                              isSoldOut
                                ? "object-cover opacity-50"
                                : "object-cover"
                            }
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3
                            className={
                              isSoldOut
                                ? "font-medium text-muted-foreground line-through"
                                : "font-medium"
                            }
                          >
                            {item.name}
                          </h3>
                          {isSoldOut && (
                            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                              今日售完
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 font-semibold">
                        {formatPrice(item.price)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
