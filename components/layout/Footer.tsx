import React from "react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/60 bg-white/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-neutral-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span>CardXManager local-first dashboard.</span>
        <span>Powered by CardXManager (c) Zedgo Glicheze</span>
      </div>
    </footer>
  );
}
