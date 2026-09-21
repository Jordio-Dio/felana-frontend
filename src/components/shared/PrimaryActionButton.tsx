import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryActionButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function PrimaryActionButton({
  label,
  onClick,
  className,
  icon = <Plus className="h-4 w-4 stroke-[2.2]" />,
  disabled = false,
  type = "button",
}: PrimaryActionButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.01, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all",
        "bg-[#8B3A1C] hover:bg-[#722F17] hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B3A1C] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {/* Conteneur d'icône épuré */}
      {icon && (
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/15 text-white">
          {icon}
        </span>
      )}

      {/* Libellé */}
      <span className="tracking-wide">{label}</span>
    </motion.button>
  );
}