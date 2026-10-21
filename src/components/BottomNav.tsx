"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, History, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/historique", label: "Historique", icon: History },
];

function BottomNavInner() {
  const pathname = usePathname();
  const isWorkout = pathname.startsWith("/seance");

  if (isWorkout) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-lg safe-bottom">
      <div className="relative mx-auto flex max-w-lg items-stretch">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors active:scale-95",
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
        <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 ring-4 ring-zinc-950">
            <Dumbbell className="h-5 w-5 text-zinc-400" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}
