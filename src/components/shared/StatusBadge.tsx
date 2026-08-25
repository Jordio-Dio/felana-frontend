import { cn } from "@/lib/utils";

type BadgeTone = "rose" | "pink" | "amber" | "gray" | "red";

const TONE_CLASSES: Record<BadgeTone, string> = {
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-gray-50 text-gray-500 border-gray-200",
  red: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className={cn("whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium", TONE_CLASSES[tone])}>
      {label}
    </span>
  );
}