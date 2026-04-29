"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactElement,
} from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
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
import { createItemAction, updateItemAction } from "@/server/menu";

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
  imageUrl: string | null;
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
  imageUrl: null,
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  // ObjectURL 由 imageFile 衍生(避免在 effect 裡 setState)
  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  // 換檔或 unmount 時釋放 ObjectURL
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function setOpen(v: boolean) {
    if (isControlled) {
      onOpenChange?.(v);
    } else {
      setInternalOpen(v);
      if (v) {
        setForm(item ?? emptyForm);
        setImageFile(null);
        setRemoveImage(false);
      }
    }
  }

  function handleFilePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("只支援 JPG / PNG / WebP");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("圖片不可超過 5MB");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
  }

  function handleClearImage() {
    if (imageFile) {
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (form.imageUrl && !removeImage) {
      setRemoveImage(true);
    }
  }

  // 顯示用:優先顯示新檔預覽,否則顯示舊圖(若沒被標記移除)
  const showPreview = previewUrl ?? (!removeImage ? form.imageUrl : null);

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

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", String(form.price));
    fd.append("categoryId", form.categoryId);
    if (imageFile) fd.append("image", imageFile);

    startTransition(async () => {
      let result;
      if (isEdit && item?.id) {
        fd.append("id", item.id);
        fd.append("isAvailable", String(form.isAvailable));
        if (removeImage) fd.append("removeImage", "true");
        result = await updateItemAction(fd);
      } else {
        result = await createItemAction(fd);
      }

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "已更新菜品" : "已新增菜品");
      setOpen(false);
      if (!isEdit) {
        setForm(emptyForm);
        setImageFile(null);
        setRemoveImage(false);
      }
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
              填寫菜品基本資訊。圖片可選,支援 JPG / PNG / WebP,單張 5MB 內。
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

            <div className="space-y-2">
              <Label>圖片(選填)</Label>
              {showPreview ? (
                <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                  <Image
                    src={showPreview}
                    alt="菜品圖片預覽"
                    fill
                    sizes="160px"
                    className="object-cover"
                    unoptimized={!!previewUrl}
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    aria-label="移除圖片"
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground shadow-sm hover:bg-background"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  <ImagePlus className="size-6" />
                  <span className="text-xs">選擇圖片</span>
                </button>
              )}
              {showPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  換一張
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFilePick}
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
