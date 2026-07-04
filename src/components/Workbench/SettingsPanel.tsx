import {
  ArrowLeftRight,
  Columns3,
  Grid2x2,
  Hexagon,
  Paintbrush,
  PencilLine,
  Rows3,
  Square,
  Type,
} from "lucide-react";
import { GRID_STYLES } from "@/components/Copybook/gridStyles";
import { useCopybookStore } from "@/store/useCopybookStore";
import { cn } from "@/lib/utils";
import type { GridStyleId, IllustrationPosition, LayoutMode } from "@/types";

const FONTS = [
  { label: "楷体 (系统)", value: 'STKaiti, "KaiTi", "楷体", serif' },
  { label: "宋体 (思源)", value: '"Noto Serif SC", serif' },
  { label: "手书 (马善政)", value: '"Ma Shan Zheng", cursive' },
  { label: "小篆风 (站酷)", value: '"ZCOOL XiaoWei", serif' },
];

const GRID_ICONS: Record<GridStyleId, React.ReactNode> = {
  tian: <Grid2x2 className="h-4 w-4" />,
  mi: <Square className="h-4 w-4" />,
  jiugong: <Hexagon className="h-4 w-4" />,
  miaohong: <Paintbrush className="h-4 w-4" />,
  lunkuo: <PencilLine className="h-4 w-4" />,
  shixin: <Type className="h-4 w-4" />,
  blank: <Square className="h-4 w-4" />,
};

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[12px] text-ink-600">
          {icon}
          {label}
        </label>
        <span className="font-mono text-[11px] text-aloes-deep">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cinnabar"
      />
    </div>
  );
}

export default function SettingsPanel() {
  const config = useCopybookStore((s) => s.config);
  const setGridStyle = useCopybookStore((s) => s.setGridStyle);
  const setLayout = useCopybookStore((s) => s.setLayout);
  const setCharsPerRow = useCopybookStore((s) => s.setCharsPerRow);
  const setRowsPerPage = useCopybookStore((s) => s.setRowsPerPage);
  const setCellSize = useCopybookStore((s) => s.setCellSize);
  const setFont = useCopybookStore((s) => s.setFont);
  const toggleTitle = useCopybookStore((s) => s.toggleTitle);
  const setCustomText = useCopybookStore((s) => s.setCustomText);
  const openAiDialog = useCopybookStore((s) => s.openAiDialog);
  const clearIllustration = useCopybookStore(
    (s) => s.clearIllustration,
  );

  return (
    <aside className="no-print flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-ink-200/60 bg-paper-warm/40 backdrop-blur-sm">
      <div className="border-b border-ink-200/60 px-5 py-4">
        <h2 className="font-display text-base text-ink-800">字帖设置</h2>
        <p className="mt-0.5 text-[11px] text-ink-500">字格 · 版式 · 规格</p>
      </div>

      <div className="space-y-6 px-5 py-4">
        {/* 自定义文本 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <PencilLine className="h-3 w-3" /> 自定义文本
          </h3>
          <textarea
            value={config.resourceId === null ? config.customText : ""}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="粘贴自定义文本（仅汉字会被保留）"
            rows={3}
            className="w-full resize-none rounded-md border border-ink-200/70 bg-paper px-3 py-2 text-[12px] leading-relaxed text-ink-700 placeholder:text-ink-400 focus:border-aloes focus:outline-none focus:ring-1 focus:ring-aloes/40"
          />
          {config.resourceId === null && (
            <p className="mt-1 text-[10px] text-cinnabar-dark">
              · 当前为自定义文本模式（共{" "}
              {Array.from(config.sourceText).filter((c) => {
                const code = c.codePointAt(0) ?? 0;
                return (
                  (code >= 0x4e00 && code <= 0x9fff) ||
                  (code >= 0x3400 && code <= 0x4dbf)
                );
              }).length}{" "}
              字）
            </p>
          )}
        </section>

        {/* 字格样式 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <Grid2x2 className="h-3 w-3" /> 字格样式
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {GRID_STYLES.map((s) => {
              const active = config.gridStyle === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setGridStyle(s.id)}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-2.5 py-2 text-left transition",
                    active
                      ? "border-cinnabar/50 bg-cinnabar/5"
                      : "border-ink-200/50 bg-paper/60 hover:border-aloes/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5",
                      active ? "text-cinnabar" : "text-ink-400",
                    )}
                  >
                    {GRID_ICONS[s.id]}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "truncate text-[12px]",
                        active ? "text-cinnabar-dark" : "text-ink-800",
                      )}
                    >
                      {s.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 版式 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <ArrowLeftRight className="h-3 w-3" /> 排版版式
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                {
                  id: "horizontal-lr",
                  label: "横排 · 左→右",
                  icon: <Rows3 className="h-4 w-4" />,
                },
                {
                  id: "vertical-rl",
                  label: "竖排 · 右→左",
                  icon: <Columns3 className="h-4 w-4" />,
                },
              ] as { id: LayoutMode; label: string; icon: React.ReactNode }[]
            ).map((opt) => {
              const active = config.layout === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLayout(opt.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] transition",
                    active
                      ? "border-cinnabar/50 bg-cinnabar/5 text-cinnabar-dark"
                      : "border-ink-200/50 bg-paper/60 text-ink-700 hover:border-aloes/50",
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 网格规格 */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <Rows3 className="h-3 w-3" /> 网格规格
          </h3>
          <Slider
            label="每行字数"
            value={config.charsPerRow}
            min={4}
            max={16}
            onChange={setCharsPerRow}
            icon={<Columns3 className="h-3 w-3" />}
          />
          <Slider
            label="每页行数"
            value={config.rowsPerPage}
            min={4}
            max={20}
            onChange={setRowsPerPage}
            icon={<Rows3 className="h-3 w-3" />}
          />
          <Slider
            label="字格大小"
            value={config.cellSize}
            min={40}
            max={120}
            step={4}
            suffix="px"
            onChange={setCellSize}
          />
        </section>

        {/* 字体 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <Type className="h-3 w-3" /> 字模字体
          </h3>
          <select
            value={config.font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full rounded-md border border-ink-200/70 bg-paper px-3 py-2 text-[12px] text-ink-700 focus:border-aloes focus:outline-none focus:ring-1 focus:ring-aloes/40"
          >
            {FONTS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </section>

        {/* 显示选项 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <Square className="h-3 w-3" /> 显示
          </h3>
          <label className="flex cursor-pointer items-center justify-between rounded-md border border-ink-200/50 bg-paper/60 px-3 py-2">
            <span className="text-[12px] text-ink-700">显示页眉标题</span>
            <input
              type="checkbox"
              checked={config.showTitle}
              onChange={toggleTitle}
              className="h-4 w-4 accent-cinnabar"
            />
          </label>
        </section>

        {/* AI 配图 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <Paintbrush className="h-3 w-3" /> AI 配图
          </h3>
          {config.illustration.url ? (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-md border border-ink-200/60">
                <img
                  src={config.illustration.url}
                  alt="配图"
                  className="h-24 w-full object-cover"
                />
              </div>
              <p className="text-[11px] text-ink-500">
                当前位置：
                {
                  (
                    {
                      header: "页眉",
                      footer: "页脚",
                      "title-page": "扉页",
                      null: "未设置",
                    } as Record<IllustrationPosition, string>
                  )[config.illustration.position]
                }
              </p>
              <div className="flex gap-2">
                <button
                  onClick={openAiDialog}
                  className="flex-1 rounded-md border border-aloes/40 bg-aloes/10 px-3 py-1.5 text-[12px] text-aloes-deep transition hover:bg-aloes/20"
                >
                  重新生成
                </button>
                <button
                  onClick={clearIllustration}
                  className="rounded-md border border-ink-200/60 px-3 py-1.5 text-[12px] text-ink-500 transition hover:bg-ink-100"
                >
                  清除
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openAiDialog}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-aloes/50 bg-aloes/5 px-3 py-3 text-[12px] text-aloes-deep transition hover:bg-aloes/10"
            >
              <Paintbrush className="h-4 w-4" />
              生成 AI 插图
            </button>
          )}
        </section>
      </div>
    </aside>
  );
}
