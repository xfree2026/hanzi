import {
  ArrowLeftRight,
  Columns3,
  Grid2x2,
  Hexagon,
  Languages,
  Paintbrush,
  Palette,
  PencilLine,
  Rows3,
  Square,
  Type,
} from "lucide-react";
import { GRID_STYLES } from "@/components/Copybook/gridStyles";
import { useCopybookStore } from "@/store/useCopybookStore";
import { cn } from "@/lib/utils";
import type {
  CharsetMode,
  GridStyleId,
  IllustrationPosition,
  LayoutMode,
} from "@/types";

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
  bihua: <PencilLine className="h-4 w-4" />,
};

/** 背景色预设 */
const BG_COLORS = [
  { label: "无", value: null, color: "#ffffff" },
  { label: "古纸", value: "#fdfaf2", color: "#fdfaf2" },
  { label: "暖米", value: "#f5efe1", color: "#f5efe1" },
  { label: "淡绿", value: "#f0f5ef", color: "#f0f5ef" },
  { label: "浅灰", value: "#f5f5f5", color: "#f5f5f5" },
  { label: "杏黄", value: "#fdf6e3", color: "#fdf6e3" },
];

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
  const setCharset = useCopybookStore((s) => s.setCharset);
  const setCharsPerRow = useCopybookStore((s) => s.setCharsPerRow);
  const setRowsPerPage = useCopybookStore((s) => s.setRowsPerPage);
  const setCellSize = useCopybookStore((s) => s.setCellSize);
  const setFont = useCopybookStore((s) => s.setFont);
  const toggleTitle = useCopybookStore((s) => s.toggleTitle);
  const setBackgroundColor = useCopybookStore((s) => s.setBackgroundColor);
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

      <div className="space-y-6 px-5 py-4 pb-12">
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
          {config.gridStyle === "bihua" && (
            <p className="mt-2 rounded-md border border-cinnabar/30 bg-cinnabar/5 px-2.5 py-1.5 text-[10px] leading-relaxed text-cinnabar-dark">
              笔画模式：每个字按笔顺展开为多个字格，逐笔增加显示。当前笔用红色高亮，需联网加载笔画数据。
            </p>
          )}
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

        {/* 字符集模式 */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-aloes-deep">
            <Languages className="h-3 w-3" /> 简繁模式
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                {
                  id: "auto",
                  label: "保持原文",
                  hint: "资源库原貌",
                },
                {
                  id: "simplified",
                  label: "简体",
                  hint: "全部转简",
                },
                {
                  id: "traditional",
                  label: "繁体",
                  hint: "全部转繁",
                },
                {
                  id: "bilingual",
                  label: "简繁对照",
                  hint: "行/列交替",
                },
              ] as { id: CharsetMode; label: string; hint: string }[]
            ).map((opt) => {
              const active = config.charset === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCharset(opt.id)}
                  className={cn(
                    "flex flex-col items-start rounded-md border px-3 py-2 text-left transition",
                    active
                      ? "border-cinnabar/50 bg-cinnabar/5"
                      : "border-ink-200/50 bg-paper/60 hover:border-aloes/50",
                  )}
                >
                  <span
                    className={cn(
                      "text-[12px]",
                      active ? "text-cinnabar-dark" : "text-ink-800",
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-ink-500">{opt.hint}</span>
                </button>
              );
            })}
          </div>
          {config.charset === "bilingual" && (
            <p className="mt-2 rounded-md border border-aloes/30 bg-aloes/5 px-2.5 py-1.5 text-[10px] leading-relaxed text-aloes-deep">
              对照模式：每个字占一整格，横排按行交替（简行/繁行），竖排按列交替（简列右、繁列左），繁体格背景色微调以示区分。
            </p>
          )}
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
        <section className="space-y-3">
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

          {/* 纸张背景色 */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[12px] text-ink-600">
              <Palette className="h-3 w-3" />
              纸张背景色
            </label>
            <div className="flex flex-wrap gap-2">
              {BG_COLORS.map((bg) => {
                const active =
                  config.backgroundColor === bg.value ||
                  (config.backgroundColor === null && bg.value === null);
                return (
                  <button
                    key={bg.label}
                    onClick={() => setBackgroundColor(bg.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border px-2 py-1.5 transition",
                      active
                        ? "border-cinnabar/50 bg-cinnabar/5"
                        : "border-ink-200/50 bg-paper/60 hover:border-aloes/50",
                    )}
                    title={bg.label}
                  >
                    <span
                      className="block h-5 w-5 rounded-full border border-ink-200/60"
                      style={{ backgroundColor: bg.color }}
                    />
                    <span className="text-[10px] text-ink-500">{bg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
