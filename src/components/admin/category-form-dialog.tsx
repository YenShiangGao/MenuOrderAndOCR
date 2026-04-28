"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/server/menu";

type EditTarget = {
  id: string;
  name: string;
  isActive: boolean;
};

type Props = {
  trigger?: ReactElement; // for "create" mode (rendered via base-ui's render prop)
  category?: EditTarget; // when present → edit mode
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CategoryFormDialog({
  trigger,
  category,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!category;
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [isPending, startTransition] = useTransition();

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  function setOpen(v: boolean) {
    if (isControlled) {
      onOpenChange?.(v);
    } else {
      setInternalOpen(v);
      if (v) setName(category?.name ?? "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = isEdit
        ? await updateCategoryAction({ id: category.id, name })
        : await createCategoryAction(name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "已更新分類" : "已新增分類");
      setOpen(false);
      if (!isEdit) setName("");
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "編輯分類" : "新增分類"}</DialogTitle>
            <DialogDescription>
              分類用於菜單分組顯示(例如:主餐 / 飲料 / 甜點)。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">分類名稱</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                required
                autoFocus
                placeholder="例如:主餐"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "儲存中..." : isEdit ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
