import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { loadResourceText, RESOURCES } from "@/data/resources";
import { useCopybookStore } from "@/store/useCopybookStore";

export default function ResourceModal() {
  const open = useCopybookStore((s) => s.resourceModalOpen);
  const id = useCopybookStore((s) => s.resourceModalId);
  const close = useCopybookStore((s) => s.closeResourceModal);
  const setResource = useCopybookStore((s) => s.setResource);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resource = id ? RESOURCES.find((r) => r.id === id) : null;

  useEffect(() => {
    if (!open || !resource) return;
    setLoading(true);
    setError(null);
    loadResourceText(resource.file)
      .then((t) => {
        setText(t);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, [open, resource]);

  if (!open || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-6 backdrop-blur-sm">
      <div className="animate-scale-in flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-ink-200/60 bg-paper shadow-paper">
        <header className="flex items-center justify-between border-b border-ink-200/60 bg-paper-warm px-6 py-4">
          <div>
            <h2 className="font-display text-xl text-ink-900">
              {resource.title}
            </h2>
            <p className="mt-0.5 text-[11px] text-ink-500">
              {resource.author} · {resource.description}
            </p>
          </div>
          <button
            onClick={close}
            className="rounded-md p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto bg-paper-warm/40 p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-aloes/30 border-t-aloes" />
            </div>
          ) : error ? (
            <div className="text-cinnabar-dark">{error}</div>
          ) : (
            <article className="font-serif text-[14px] leading-loose text-ink-800 whitespace-pre-wrap">
              {text}
            </article>
          )}
        </div>
        <footer className="flex items-center justify-between border-t border-ink-200/60 bg-paper px-6 py-3">
          <span className="text-[11px] text-ink-500">
            共 {Array.from(text).length} 字
          </span>
          <div className="flex gap-2">
            <button
              onClick={close}
              className="rounded-md border border-ink-200/60 px-4 py-1.5 text-[12px] text-ink-600 transition hover:bg-ink-100"
            >
              关闭
            </button>
            <button
              onClick={() => {
                setResource(resource.id);
                close();
              }}
              className="rounded-md bg-cinnabar px-4 py-1.5 text-[12px] font-medium text-paper shadow-seal transition hover:bg-cinnabar-dark"
            >
              加入字帖
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
