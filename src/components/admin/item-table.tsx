"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ItemFormDialog,
  type CategoryOption,
  type ItemFormValues,
} from "./item-form-dialog";
import {
  deleteItemAction,
  toggleItemAvailableAction,
  toggleSoldOutAction,
} from "@/server/menu";
import { cn } from "@/lib/utils";

export type ItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  isSoldOutToday: boolean;
  imageUrl: string | null;
  category: { id: string; name: string };
};

function formatPrice(p: number) {
  return `$${p.toLocaleString()}`;
}

export function ItemTable({
  items,
  categories,
}: {
  items: ItemRow[];
  categories: CategoryOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<ItemFormValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemRow | null>(null);

  function handleToggleAvailable(item: ItemRow) {
    startTransition(async () => {
      const result = await toggleItemAvailableAction(item.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`已${item.isAvailable ? "下架" : "上架"}「${item.name}」`);
    });
  }

  function handleToggleSoldOut(item: ItemRow) {
    startTransition(async () => {
      const result = await toggleSoldOutAction(item.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        item.isSoldOutToday
          ? `「${item.name}」已恢復供應`
          : `「${item.name}」已標記今日售完`,
      );
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteItemAction(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`已刪除「${target.name}」`);
      setDeleteTarget(null);
    });
  }

  function openEdit(item: ItemRow) {
    setEditTarget({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      categoryId: item.category.id,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ItemFormDialog
          categories={categories}
          trigger={
            <Button disabled={categories.length === 0}>
              <Plus className="size-4" /> 新增菜品
            </Button>
          }
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">圖片</TableHead>
              <TableHead>品名</TableHead>
              <TableHead className="w-32">分類</TableHead>
              <TableHead className="w-24">價格</TableHead>
              <TableHead className="w-24">上架</TableHead>
              <TableHead className="w-24">今日售完</TableHead>
              <TableHead className="w-32 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {categories.length === 0
                    ? "請先到「菜單分類」建立至少一個分類"
                    : "目前沒有菜品,點右上角「新增菜品」開始建立"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <div className="relative size-10 overflow-hidden rounded-md">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.category.name}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailable(item)}
                      disabled={isPending}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50",
                        item.isAvailable
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      {item.isAvailable ? "上架" : "下架"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleSoldOut(item)}
                      disabled={isPending}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50",
                        item.isSoldOutToday
                          ? "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      {item.isSoldOutToday ? "售完" : "供應中"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(item)}
                      aria-label="編輯"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                      disabled={isPending}
                      aria-label="刪除"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editTarget && (
        <ItemFormDialog
          item={editTarget}
          categories={categories}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
        />
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除菜品「{deleteTarget?.name}」嗎?此動作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "刪除中..." : "刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
