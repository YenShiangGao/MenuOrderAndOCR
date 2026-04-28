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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createItemAction,
  updateItemAction,
} from "@/server/menu";

export type CategoryOption = {
  id: string;
  name: string;
};

export type ItemFormValues = {
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
};

type Props = {
  trigger?: ReactElement;
  item?: ItemFormValues;
  categories: CategoryOption[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const emptyForm: ItemFormValues = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  isAvailable: true,
};

export function ItemFormDialog({
  trigger,
  item,
  categories,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!item;
  const [internalOpen, setInternalOpen] = useState(false);
  const [form, setForm] = useState<ItemFormValues>(item ?? emptyForm);
  const [isPending, startTransition] = useTransition();

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  function setOpen(v: boolean) {
    if (isControlled) {
      onOpenChange?.(v);
    } else {
      setInternalOpen(v);
      if (v) setForm(item ?? emptyForm);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (categories.length === 0) {
      toast.error("請先建立至少一個分類");
      return;
    }
    if (!form.categoryId) {
      toast.error("請選擇分類");
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateItemAction({
            id: item.id!,
            name: form.name,
            description: form.description || undefined,
            price: form.price,
            categoryId: form.categoryId,
            isAvailable: form.isAvailable,
          })
        : await createItemAction({
            name: form.name,
            description: form.description || undefined,
            price: form.price,
            categoryId: form.categoryId,
          });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "已更新菜品" : "已新增菜品");
      setOpen(false);
      if (!isEdit) setForm(emptyForm);
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "編輯菜品" : "新增菜品"}</DialogTitle>
            <DialogDescription>
              填寫菜品基本資訊。圖片上傳將於後續版本提供。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">品名</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                maxLength={50}
                required
                placeholder="例如:招牌牛肉麵"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">分類</Label>
              <Select
                value={form.categoryId || undefined}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, categoryId: v ?? "" }))
                }
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">價格(元)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                max={99999}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述(選填)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                maxLength={200}
                rows={3}
                placeholder="例如:慢燉 8 小時的紅燒湯頭"
              />
            </div>
            {isEdit && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="isAvailable" className="font-medium">
                    上架
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    停用後不會出現在前台菜單
                  </p>
                </div>
                <Switch
                  id="isAvailable"
                  checked={form.isAvailable}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isAvailable: v }))
                  }
                />
              </div>
            )}
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
            <Button
              type="submit"
              disabled={isPending || !form.name.trim() || !form.categoryId}
            >
              {isPending ? "儲存中..." : isEdit ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
