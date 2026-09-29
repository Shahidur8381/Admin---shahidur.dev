import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "purple";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
        {
          "border border-transparent bg-indigo-500/20 text-indigo-300 border-indigo-500/30":
            variant === "default",
          "border border-zinc-700 bg-zinc-800 text-zinc-300":
            variant === "secondary",
          "border border-zinc-700 text-zinc-300":
            variant === "outline",
          "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300":
            variant === "success",
          "border border-amber-500/30 bg-amber-500/15 text-amber-300":
            variant === "warning",
          "border border-red-500/30 bg-red-500/15 text-red-300":
            variant === "destructive",
          "border border-purple-500/30 bg-purple-500/15 text-purple-300":
            variant === "purple",
        },
        className
      )}
      {...props}
    />
  );
}
