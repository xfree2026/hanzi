import { useMemo } from "react";
import CopybookPageView from "@/components/Copybook/CopybookPage";
import { useCopybookStore } from "@/store/useCopybookStore";
import { paginate } from "@/generator/paginator";
import { RESOURCES } from "@/data/resources";

export default function PreviewCanvas() {
  const config = useCopybookStore((s) => s.config);
  const loadingResource = useCopybookStore((s) => s.loadingResource);
  const loadError = useCopybookStore((s) => s.loadError);
  const strokeDataMap = useCopybookStore((s) => s.strokeDataMap);
  const strokeDataLoading = useCopybookStore((s) => s.strokeDataLoading);

  const pages = useMemo(
    () => paginate(config, config.enableStroke ? strokeDataMap : undefined),
    [config, strokeDataMap],
  );

  const title = useMemo(() => {
    if (config.resourceId) {
      const r = RESOURCES.find((r) => r.id === config.resourceId);
      return r?.title ?? "字帖";
    }
    return "自定义字帖";
  }, [config.resourceId]);

  const isLoading = loadingResource || (config.enableStroke && strokeDataLoading);

  return (
    <main className="copybook-print-area relative flex h-full flex-1 flex-col overflow-hidden bg-paper">
      {/* 顶部信息栏 */}
      <div className="no-print flex items-center justify-between border-b border-ink-200/50 bg-paper/70 px-6 py-2 backdrop-blur">
        <span className="text-[11px] text-ink-500">
          {isLoading ? "正在加载…" : `共 ${pages.length} 页 · 每页 A4`}
        </span>
      </div>

      {/* 预览画布：渲染所有页面，可滚动查看 */}
      <div className="relative flex-1 overflow-auto no-print">
        {loadError ? (
          <div className="flex h-full items-center justify-center text-cinnabar-dark">
            加载失败：{loadError}
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-aloes/30 border-t-aloes" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 px-6 py-8">
            {pages.map((p) => (
              <div key={p.index} className="w-full max-w-[820px]">
                {/* 页码标签 */}
                <div className="no-print mb-2 text-center text-[10px] text-ink-400">
                  第 {p.index + 1} / {pages.length} 页
                </div>
                {/* A4 比例容器，兼作打印容器 */}
                <div className="preview-page print-page aspect-[210/297] w-full overflow-hidden rounded-sm border border-ink-200/40 bg-white shadow-paper">
                  <CopybookPageView
                    page={p}
                    config={config}
                    title={title}
                    strokeDataMap={strokeDataMap}
                    responsive
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
