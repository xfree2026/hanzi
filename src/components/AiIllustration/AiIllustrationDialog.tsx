import { ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useCopybookStore } from "@/store/useCopybookStore";
import { cn } from "@/lib/utils";
import type { IllustrationPosition, IllustrationStyle } from "@/types";

const STYLES: { id: IllustrationStyle; label: string; desc: string }[] = [
  { id: "ink", label: "水墨写意", desc: "墨色晕染，留白意境" },
  { id: "gongbi", label: "工笔重彩", desc: "院体画风，浓墨重色" },
  { id: "line", label: "白描线稿", desc: "细笔勾勒，纯净典雅" },
  { id: "woodblock", label: "雕版木刻", desc: "刀法古拙，黑白对比" },
];

const POSITIONS: {
  id: IllustrationPosition;
  label: string;
}[] = [
  { id: "title-page", label: "扉页（封面）" },
  { id: "header", label: "页眉" },
  { id: "footer", label: "页脚" },
];

const SUGGESTIONS = [
  "远山云水，松下问童子",
  "杏林春晓，鸟雀啭鸣",
  "黄河远上，白云一片",
  "高山流水，渔樵问答",
  "梅兰竹菊，四君子图",
];

export default function AiIllustrationDialog() {
  const open = useCopybookStore((s) => s.aiDialogOpen);
  const close = useCopybookStore((s) => s.closeAiDialog);
  const generating = useCopybookStore((s) => s.aiGenerating);
  const error = useCopybookStore((s) => s.aiError);
  const generate = useCopybookStore((s) => s.generateIllustration);

  const [prompt, setPrompt] = useState(SUGGESTIONS[0]);
  const [style, setStyle] = useState<IllustrationStyle>("ink");
  const [position, setPosition] = useState<IllustrationPosition>("title-page");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-6 backdrop-blur-sm">
      <div className="animate-scale-in flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-ink-200/60 bg-paper shadow-paper">
        <header className="flex items-center justify-between border-b border-ink-200/60 bg-paper-warm px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cinnabar" />
            <h2 className="font-display text-lg text-ink-900">AI 配图插图</h2>
          </div>
          <button
            onClick={close}
            className="rounded-md p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[12px] text-ink-600">
              主题提示词
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="描述你想要的插图意境…"
              className="w-full resize-none rounded-md border border-ink-200/70 bg-paper px-3 py-2 text-[13px] leading-relaxed text-ink-800 placeholder:text-ink-400 focus:border-aloes focus:outline-none focus:ring-1 focus:ring-aloes/40"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="rounded-full border border-ink-200/60 bg-paper/60 px-2.5 py-1 text-[11px] text-ink-500 transition hover:border-aloes/40 hover:text-aloes-deep"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[12px] text-ink-600">
              风格预设
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => {
                const active = style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-left transition",
                      active
                        ? "border-cinnabar/50 bg-cinnabar/5"
                        : "border-ink-200/50 bg-paper/60 hover:border-aloes/50",
                    )}
                  >
                    <div
                      className={cn(
                        "text-[12px]",
                        active ? "text-cinnabar-dark" : "text-ink-800",
                      )}
                    >
                      {s.label}
                    </div>
                    <div className="text-[10px] text-ink-500">{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[12px] text-ink-600">
              插入位置
            </label>
            <div className="flex gap-2">
              {POSITIONS.map((p) => {
                const active = position === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPosition(p.id)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-[12px] transition",
                      active
                        ? "border-cinnabar/50 bg-cinnabar/5 text-cinnabar-dark"
                        : "border-ink-200/50 bg-paper/60 text-ink-700 hover:border-aloes/50",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-3 py-2 text-[12px] text-cinnabar-dark">
              {error}
            </p>
          )}

          <p className="text-[10px] leading-relaxed text-ink-400">
            插图由 TRAE 文生图接口实时生成，水墨晕染、留白构图，与字帖意境相得益彰。生成后将自动应用到当前字帖。
          </p>
        </div>

        <footer className="flex justify-end gap-2 border-t border-ink-200/60 bg-paper px-6 py-3">
          <button
            onClick={close}
            className="rounded-md border border-ink-200/60 px-4 py-1.5 text-[12px] text-ink-600 transition hover:bg-ink-100"
          >
            取消
          </button>
          <button
            disabled={generating || !prompt.trim()}
            onClick={() => generate(prompt.trim(), style, position)}
            className="flex items-center gap-1.5 rounded-md bg-cinnabar px-4 py-1.5 text-[12px] font-medium text-paper shadow-seal transition hover:bg-cinnabar-dark disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                生成中…
              </>
            ) : (
              <>
                <ImagePlus className="h-3.5 w-3.5" />
                生成配图
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
