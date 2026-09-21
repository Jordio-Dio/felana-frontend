import { cn } from "@/lib/utils";

export type BadgeTone =
  | "terracotta"
  | "amber"
  | "emerald"
  | "red"
  | "stone"
  | "rose"
  | "pink"
  | "gray";

interface ToneStyle {
  badge: string;
  dot: string;
}

const TONE_CLASSES: Record<BadgeTone, ToneStyle> = {
  terracotta: {
    badge: "bg-[#FAF6F4] text-[#8B3A1C] border-[#F2E6E1]",
    dot: "bg-[#8B3A1C]",
  },
  amber: {
    badge: "bg-amber-50/80 text-amber-800 border-amber-200/60",
    dot: "bg-amber-500",
  },
  emerald: {
    badge: "bg-emerald-50/80 text-emerald-800 border-emerald-200/60",
    dot: "bg-emerald-500",
  },
  red: {
    badge: "bg-rose-50/80 text-rose-700 border-rose-200/60",
    dot: "bg-rose-500",
  },
  stone: {
    badge: "bg-stone-100/80 text-stone-600 border-stone-200/60",
    dot: "bg-stone-400",
  },
  gray: {
    badge: "bg-stone-100/80 text-stone-600 border-stone-200/60",
    dot: "bg-stone-400",
  },
  rose: {
    badge: "bg-pink-50/80 text-pink-700 border-pink-200/60",
    dot: "bg-pink-500",
  },
  pink: {
    badge: "bg-pink-50/80 text-pink-700 border-pink-200/60",
    dot: "bg-pink-500",
  },
};

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
  withDot?: boolean;
  className?: string;
}

export function StatusBadge({
  label,
  tone,
  withDot = true,
  className,
}: StatusBadgeProps) {
  const currentTone = TONE_CLASSES[tone] ?? TONE_CLASSES.stone;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        currentTone.badge,
        className
      )}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", currentTone.dot)}
        />
      )}
      <span>{label}</span>
    </span>
  );
}