"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { CategoryFormDialog } from "./category-form-dialog";
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/menu";
import { cn } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
};

export function CategoryTable({ categories }: { categories: CategoryRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<CategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  function handleToggle(cat: CategoryRow) {
    startTransition(async () => {
      const result = await updateCategoryAction({
        id: cat.id,
        isActive: !cat.isActive,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`已${cat.isActive ? "停用" : "啟用"}「${cat.name}」`);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteCategoryAction(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`已刪除「${target.name}」`);
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" /> 新增分類
            </Button>
          }
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">順序</TableHead>
              <TableHead>名稱</TableHead>
              <TableHead className="w-24">菜品數</TableHead>
              <TableHead className="w-28">狀態</TableHead>
              <TableHead className="w-32 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  目前沒有分類,點右上角「新增分類」開始建立
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-muted-foreground">
                    {cat.sortOrder}
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.itemCount}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggle(cat)}
                      disabled={isPending}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                        cat.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                        "disabled:opacity-50",
                      )}
                    >
                      {cat.isActive ? "啟用" : "停用"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditTarget(cat)}
                      aria-label="編輯"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(cat)}
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
        <CategoryFormDialog
          category={editTarget}
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
              確定要刪除分類「{deleteTarget?.name}」嗎?此動作無法復原。
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
