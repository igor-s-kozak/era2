import type { GenType } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { FileText, Image, Music, Video } from "lucide-react";
interface TaskThumbProps {
  type: GenType;
  size?: "sm" | "md";
  className?: string;
}

const ICONS: Record<
  GenType,
  React.FC<{ size: number; strokeWidth: number }>
> = {
  image: Image,
  video: Video,
  text: FileText,
  audio: Music,
};

const BG: Record<GenType, string> = {
  image: "bg-[rgba(232,84,32,0.12)] text-[var(--era-accent-2)]",
  video: "bg-[rgba(100,120,255,0.12)] text-[#8899ff]",
  text: "bg-[rgba(200,190,182,0.1)] text-[var(--era-fg-mute)]",
  audio: "bg-[rgba(76,175,125,0.12)] text-[#4caf7d]",
};

export function TaskThumb({ type, size = "md", className }: TaskThumbProps) {
  const Icon = ICONS[type];
  const iconSize = size === "sm" ? 16 : 20;
  const containerSize = size === "sm" ? "w-7 h-7" : "w-14 h-14";
  const radius = size === "sm" ? "rounded-lg" : "rounded-xl";

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        containerSize,
        radius,
        BG[type],
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={1.8} />
    </div>
  );
}
