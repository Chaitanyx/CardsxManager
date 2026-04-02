import React from "react";

export function EmptyState({
  title,
  subtitle,
  size = "default"
}: {
  title: string;
  subtitle: string;
  size?: "default" | "compact";
}) {
  const isCompact = size === "compact";

  return (
    <div className={`glass-panel ${isCompact ? "px-4 py-6" : "px-6 py-10"} text-center text-neutral-500`}>
      <div
        className={`mx-auto ${isCompact ? "mb-3 h-16 w-16" : "mb-4 h-24 w-24"} rounded-[28px] border border-white/70 bg-white/70 shadow-sm relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(31,122,255,0.18),transparent_55%)]" />
        <div className="absolute inset-3 rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 via-white/70 to-white/40" />
        <div className="absolute left-5 top-6 h-3 w-10 rounded-full bg-neutral-800/10" />
        <div className="absolute right-4 bottom-5 h-2 w-6 rounded-full bg-neutral-800/10" />
      </div>
      <p className={`font-semibold ${isCompact ? "text-base" : "text-lg"} text-neutral-700`}>{title}</p>
      <p className={isCompact ? "text-xs" : "text-sm"}>{subtitle}</p>
    </div>
  );
}
