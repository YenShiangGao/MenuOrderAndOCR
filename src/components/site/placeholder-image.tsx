import { cn } from "@/lib/utils";

const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
} as const;

type Props = {
  aspect?: keyof typeof aspectClasses;
  label?: string;
  className?: string;
};

/**
 * 純 CSS 佔位塊,零素材依賴。
 * 客戶提供照片後,把這個元件換成 `next/image` 即可(call site 改一處)。
 */
export function PlaceholderImage({
  aspect = "video",
  label = "形象照",
  className,
}: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground",
        aspectClasses[aspect],
        className,
      )}
    >
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest opacity-60">
          圖片佔位
        </p>
        <p className="mt-1 text-sm">{label}</p>
      </div>
    </div>
  );
}
