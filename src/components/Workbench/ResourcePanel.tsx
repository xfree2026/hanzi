import {
  BookOpen,
  ExternalLink,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS, RESOURCES } from "@/data/resources";
import { useCopybookStore } from "@/store/useCopybookStore";
import { cn } from "@/lib/utils";
import type { ResourceCategory } from "@/types";

const CATEGORY_ORDER: ResourceCategory[] = ["primer", "poetry", "medicine"];

export default function ResourcePanel() {
  const resourceId = useCopybookStore((s) => s.config.resourceId);
  const setResource = useCopybookStore((s) => s.setResource);
  const openResourceModal = useCopybookStore((s) => s.openResourceModal);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = RESOURCES.filter((r) => {
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.author?.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: filtered.filter((r) => r.category === cat),
    }));
  }, [query]);

  return (
    <aside className="no-print flex h-full w-72 shrink-0 flex-col border-r border-ink-200/60 bg-paper-warm/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <BookOpen className="h-4 w-4 text-aloes-deep" />
        <h2 className="font-display text-base text-ink-800">资源库</h2>
      </div>

      <div className="relative px-4 pb-3">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索典籍…"
          className="w-full rounded-md border border-ink-200/70 bg-paper py-1.5 pl-7 pr-3 text-sm text-ink-700 placeholder:text-ink-400 focus:border-aloes focus:outline-none focus:ring-1 focus:ring-aloes/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {groups.map((group) =>
          group.items.length === 0 ? null : (
            <section key={group.category} className="mb-5">
              <h3 className="mb-2 flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
                <span className="h-px w-3 bg-aloes/50" />
                {group.label}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((r) => {
                  const active = r.id === resourceId;
                  return (
                    <li key={r.id}>
                      <div
                        onClick={() => setResource(r.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setResource(r.id);
                          }
                        }}
                        className={cn(
                          "group block w-full cursor-pointer rounded-lg border px-3 py-2.5 text-left transition",
                          active
                            ? "border-cinnabar/40 bg-cinnabar/5 shadow-sm"
                            : "border-ink-200/50 bg-paper/60 hover:border-aloes/50 hover:bg-paper",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-serif text-sm",
                              active ? "text-cinnabar-dark" : "text-ink-800",
                            )}
                          >
                            {r.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openResourceModal(r.id);
                            }}
                            className="text-ink-400 transition hover:text-aloes-deep"
                            title="查看原文"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {r.author && (
                          <p className="mt-0.5 text-[11px] text-ink-400">
                            {r.author}
                          </p>
                        )}
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-500">
                          {r.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
        )}
      </div>

      <div className="border-t border-ink-200/60 bg-paper/60 px-4 py-3 text-[11px] leading-relaxed text-ink-500">
        共 {RESOURCES.length} 部典籍 · 7 类经典
        <br />
        可在「设置」中粘贴自定义文本生成字帖
      </div>
    </aside>
  );
}
