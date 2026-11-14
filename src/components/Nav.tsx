"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Today" },
  { href: "/progress", label: "Progress" },
  { href: "/setup", label: "Classes & sources" },
];

export function Nav() {
  const path = usePathname();
  if (path?.startsWith("/style") || path?.startsWith("/grass-demo")) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none" aria-label="Main">
      <div className="pointer-events-auto mb-3 card !rounded-full px-1.5 py-1.5 flex gap-1 shadow-lg">
        {items.map((it) => {
          const on = it.href === "/" ? path === "/" : path?.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} className={`px-4 py-1.5 rounded-full text-sm font-medium ${on ? "bg-blue text-text-blue" : "text-text-muted hover:bg-paper-2"}`} aria-current={on ? "page" : undefined}>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
