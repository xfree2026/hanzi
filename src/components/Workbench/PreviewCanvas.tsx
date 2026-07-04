import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import CopybookPageView from "@/components/Copybook/CopybookPage";
import { useCopybookStore } from "@/store/useCopybookStore";
import { paginate } from "@/generator/paginator";
import { RESOURCES } from "@/data/resources";

export default function PreviewCanvas() {
  const config = useCopybookStore((s) => s.config);
  const currentPage = useCopybookStore((s) => s.currentPage);
  const setCurrentPage = useCopybookStore((s) => s.setCurrentPage);
  const loadingResource = useCopybookStore((s) => s.loadingResource);
  const loadError = useCopybookStore((s) => s.loadError);

  const pages = useMemo(() => paginate(config), [config]);

  const title = useMemo(() => {
    if (config.resourceId) {
      const r = RESOURCES.find((r) => r.id === config.resourceId);
      return r?.title ?? "字帖";
    }
    return "自定义字帖";
  }, [config.resourceId]);

  const safePageIdx = Math.min(currentPage, pages.length - 1);
  const page = pages[safePageIdx];

  return (
    <main className="copybook-print-area relative flex h-full flex-1 flex-col overflow-hidden bg-paper">
      {/* 顶部页码工具 */}
      <div className="no-print flex items-center justify-between border-b border-ink-200/50 bg-paper/70 px-6 py-2 backdrop-blur">
        <span className="text-[11px] text-ink-500">
          {loadingResource ? "正在加载资源…" : `共 ${pages.length} 页`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(safePageIdx - 1)}
            disabled={safePageIdx <= 0}
            className="rounded-md border border-ink-200/60 bg-paper p-1.5 text-ink-600 transition hover:border-aloes/50 hover:text-aloes-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[5rem] text-center font-mono text-[12px] text-ink-700">
            {safePageIdx + 1} / {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(safePageIdx + 1)}
            disabled={safePageIdx >= pages.length - 1}
            className="rounded-md border border-ink-200/60 bg-paper p-1.5 text-ink-600 transition hover:border-aloes/50 hover:text-aloes-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 预览画布 */}
      <div className="relative flex-1 overflow-auto">
        {loadError ? (
          <div className="flex h-full items-center justify-center text-cinnabar-dark">
            加载失败：{loadError}
          </div>
        ) : loadingResource ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-aloes/30 border-t-aloes" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 px-6 py-8">
            {pages.map((p) => (
              <div
                key={p.index}
                className="print-page w-fit overflow-hidden rounded-sm border border-ink-200/40 bg-white shadow-paper"
              >
                <CopybookPageView page={p} config={config} title={title} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 当前页提示（非打印） */}
      {!loadingResource && !loadError && (
        <div className="no-print pointer-events-none absolute bottom-4 right-6 rounded-full bg-ink-900/70 px-3 py-1 text-[11px] text-paper backdrop-blur">
          当前预览第 {safePageIdx + 1} 页 · 滚动查看全部
        </div>
      )}
    </main>
  );
}
