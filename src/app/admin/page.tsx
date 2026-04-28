import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await getSession();
  const [categoryCount, itemCount, soldOutCount] = await Promise.all([
    prisma.menuCategory.count({ where: { isActive: true } }),
    prisma.menuItem.count({ where: { isAvailable: true } }),
    prisma.menuItem.count({
      where: {
        soldOutAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">後台首頁</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          歡迎,{session.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              啟用中分類
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categoryCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              上架菜品
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{itemCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日售完
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{soldOutCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">下一步</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Day 2 完成。Week 2 將實作菜單分類與菜品的完整 CRUD。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
