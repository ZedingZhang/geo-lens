"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Sparkles,
  FileText,
  Stethoscope,
  GitCompare,
  Lightbulb,
  ShieldCheck,
  MessageSquareText,
  Map,
  FlaskConical,
  BookOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/projects", label: "Projects", icon: FolderOpen },
      { href: "/projects/new", label: "New Project", icon: PlusCircle },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/strategies", label: "Strategy Library", icon: BookOpen },
    ],
  },
];

const projectNav = [
  { href: "", label: "GEO Score", icon: Sparkles },
  { href: "/questions", label: "AI Questions", icon: MessageSquareText },
  {
    href: "/recommendations",
    label: "Recommendations",
    icon: FileText,
  },
  { href: "/diagnostics", label: "Diagnostics", icon: Stethoscope },
  { href: "/diff", label: "Before/After Diff", icon: GitCompare },
  { href: "/readiness", label: "Technical Audit", icon: ShieldCheck },
  { href: "/prompts", label: "Prompt Portfolio", icon: Lightbulb },
  { href: "/sources", label: "Source Map", icon: Map },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const projectId = pathname.match(/\/projects\/([^/]+)/)?.[1];

  return (
    <div className="flex min-h-[calc(100vh-41px)]">
      {/* Sidebar */}
      <aside className="w-60 border-r border-[var(--border)] bg-[var(--card)] shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[var(--primary)] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-base">GEO Lens</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navigation.map((group) => (
            <div key={group.label}>
              <div className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-2 mb-1.5">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Project-specific navigation */}
          {projectId && (
            <div>
              <div className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-2 mb-1.5">
                Project
              </div>
              <ul className="space-y-0.5">
                {projectNav.map((item) => {
                  const Icon = item.icon;
                  const href = `/projects/${projectId}${item.href}`;
                  const isActive =
                    item.href === ""
                      ? pathname === `/projects/${projectId}`
                      : pathname.startsWith(href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
              pathname === "/settings"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
