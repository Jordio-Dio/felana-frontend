import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryActionButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function PrimaryActionButton({
  label,
  onClick,
  className,
  icon = <Plus className="h-4 w-4 stroke-[2.5]" />,
}: PrimaryActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-1.5 text-sm font-semibold text-rose-900",
        "bg-gradient-to-b from-pink-200 via-pink-300 to-rose-300",
        "border border-pink-300/80 shadow-md shadow-pink-400/40 transition-all hover:shadow-lg hover:shadow-pink-400/60",
        "focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2",
        className
      )}
    >
      {/* Reflet supérieur Glossy */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent" />

      <span className="relative z-10 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-pink-400/30 text-rose-900">
        {icon}
      </span>
      <span className="relative z-10 font-bold tracking-tight">{label}</span>
    </motion.button>
  );
}