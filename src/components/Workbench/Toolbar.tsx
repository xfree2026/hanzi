import { Printer } from "lucide-react";
import { useCopybookStore } from "@/store/useCopybookStore";
import { RESOURCES } from "@/data/resources";

export default function Toolbar() {
  const resourceId = useCopybookStore((s) => s.config.resourceId);
  const openAiDialog = useCopybookStore((s) => s.openAiDialog);

  const title = resourceId
    ? (RESOURCES.find((r) => r.id === resourceId)?.title ?? "字帖")
    : "自定义字帖";

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="no-print flex h-14 items-center justify-between border-b border-ink-200/60 bg-paper/80 px-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="seal-stamp">翰墨</span>
        <div className="flex flex-col leading-tight">
          <h1 className="font-display text-lg tracking-wide text-ink-900">
            翰墨字帖
          </h1>
          <p className="text-[10px] text-ink-500">汉字临摹 · 经典字帖生成器</p>
        </div>
        <div className="ml-4 hidden h-7 w-px bg-ink-200/70 sm:block" />
        <p className="hidden text-[12px] text-ink-600 sm:block">
          当前文本：<span className="font-serif text-ink-900">{title}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openAiDialog}
          className="hidden items-center gap-1.5 rounded-md border border-aloes/40 bg-aloes/5 px-3 py-1.5 text-[12px] text-aloes-deep transition hover:bg-aloes/10 sm:flex"
        >
          AI 配图
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-md bg-cinnabar px-4 py-1.5 text-[12px] font-medium text-paper shadow-seal transition hover:bg-cinnabar-dark"
        >
          <Printer className="h-3.5 w-3.5" />
          打印 / 导出
        </button>
      </div>
    </header>
  );
}
