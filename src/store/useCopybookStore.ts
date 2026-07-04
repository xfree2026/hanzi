import { create } from "zustand";
import type {
  CopybookConfig,
  GridStyleId,
  IllustrationPosition,
  IllustrationStyle,
  LayoutMode,
} from "@/types";
import { RESOURCES, loadResourceText } from "@/data/resources";

interface CopybookState {
  config: CopybookConfig;
  /** 当前页索引 */
  currentPage: number;
  /** 资源加载状态 */
  loadingResource: boolean;
  loadError: string | null;
  /** 是否显示资源原文弹窗 */
  resourceModalOpen: boolean;
  resourceModalId: string | null;
  /** 是否显示 AI 配图弹窗 */
  aiDialogOpen: boolean;
  /** AI 配图生成中 */
  aiGenerating: boolean;
  aiError: string | null;

  setResource: (id: string | null) => Promise<void>;
  setCustomText: (text: string) => void;
  setGridStyle: (id: GridStyleId) => void;
  setLayout: (mode: LayoutMode) => void;
  setCharsPerRow: (n: number) => void;
  setRowsPerPage: (n: number) => void;
  setCellSize: (n: number) => void;
  setFont: (font: string) => void;
  togglePinyin: () => void;
  toggleTitle: () => void;
  setCurrentPage: (n: number) => void;
  openResourceModal: (id: string) => void;
  closeResourceModal: () => void;
  openAiDialog: () => void;
  closeAiDialog: () => void;
  generateIllustration: (
    prompt: string,
    style: IllustrationStyle,
    position: IllustrationPosition,
  ) => Promise<void>;
  clearIllustration: () => void;
}

const DEFAULT_CONFIG: CopybookConfig = {
  resourceId: "qian-zi-wen",
  customText: "",
  sourceText: "",
  gridStyle: "mi",
  layout: "horizontal-lr",
  charsPerRow: 8,
  rowsPerPage: 10,
  cellSize: 64,
  font: 'STKaiti, "KaiTi", "楷体", "Noto Serif SC", serif',
  showPinyin: false,
  showTitle: true,
  illustration: { url: null, position: null },
};

const AI_STYLE_PROMPTS: Record<IllustrationStyle, string> = {
  ink: "中国传统水墨写意，墨色晕染，大量留白，淡雅空灵",
  gongbi: "工笔重彩，线条细腻，色彩浓郁典雅，宋代院体画风",
  line: "白描线描，细笔勾勒，无填色，传统中国画线稿",
  woodblock: "传统雕版木刻版画，刀法古拙，黑白对比强烈",
};

export const useCopybookStore = create<CopybookState>((set, get) => ({
  config: DEFAULT_CONFIG,
  currentPage: 0,
  loadingResource: true,
  loadError: null,
  resourceModalOpen: false,
  resourceModalId: null,
  aiDialogOpen: false,
  aiGenerating: false,
  aiError: null,

  setResource: async (id) => {
    set({ loadingResource: true, loadError: null, currentPage: 0 });
    try {
      if (id === null) {
        // 自定义文本模式：以已有 customText 为源
        const text = get().config.customText;
        set((s) => ({
          config: { ...s.config, resourceId: null, sourceText: text },
          loadingResource: false,
        }));
        return;
      }
      const resource = RESOURCES.find((r) => r.id === id);
      if (!resource) {
        set({ loadingResource: false, loadError: "未找到资源" });
        return;
      }
      const text = await loadResourceText(resource.file);
      set((s) => ({
        config: {
          ...s.config,
          resourceId: id,
          sourceText: text,
          customText: "",
        },
        loadingResource: false,
      }));
    } catch (e) {
      set({
        loadingResource: false,
        loadError: e instanceof Error ? e.message : String(e),
      });
    }
  },

  setCustomText: (text) =>
    set((s) => ({
      config: {
        ...s.config,
        resourceId: null,
        customText: text,
        sourceText: text,
      },
      currentPage: 0,
    })),

  setGridStyle: (id) =>
    set((s) => ({ config: { ...s.config, gridStyle: id } })),
  setLayout: (mode) =>
    set((s) => ({ config: { ...s.config, layout: mode }, currentPage: 0 })),
  setCharsPerRow: (n) =>
    set((s) => ({
      config: { ...s.config, charsPerRow: Math.max(1, Math.min(20, n)) },
      currentPage: 0,
    })),
  setRowsPerPage: (n) =>
    set((s) => ({
      config: { ...s.config, rowsPerPage: Math.max(1, Math.min(30, n)) },
      currentPage: 0,
    })),
  setCellSize: (n) =>
    set((s) => ({
      config: { ...s.config, cellSize: Math.max(32, Math.min(160, n)) },
    })),
  setFont: (font) => set((s) => ({ config: { ...s.config, font } })),
  togglePinyin: () =>
    set((s) => ({ config: { ...s.config, showPinyin: !s.config.showPinyin } })),
  toggleTitle: () =>
    set((s) => ({ config: { ...s.config, showTitle: !s.config.showTitle } })),
  setCurrentPage: (n) => set({ currentPage: Math.max(0, n) }),

  openResourceModal: (id) =>
    set({ resourceModalOpen: true, resourceModalId: id }),
  closeResourceModal: () =>
    set({ resourceModalOpen: false, resourceModalId: null }),
  openAiDialog: () => set({ aiDialogOpen: true, aiError: null }),
  closeAiDialog: () => set({ aiDialogOpen: false, aiError: null }),

  generateIllustration: async (prompt, style, position) => {
    set({ aiGenerating: true, aiError: null });
    try {
      const stylePrompt = AI_STYLE_PROMPTS[style];
      const fullPrompt = `${stylePrompt}，主题：${prompt}，无文字，构图典雅，宣纸质感`;
      const encoded = encodeURIComponent(fullPrompt);
      const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encoded}&image_size=landscape_16_9`;
      // 预加载图像，确认可用后再应用
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("图像生成失败，请稍后重试或更换提示词"));
        img.src = url;
      });
      set((s) => ({
        config: {
          ...s.config,
          illustration: { url, position },
        },
        aiGenerating: false,
        aiDialogOpen: false,
      }));
    } catch (e) {
      set({
        aiGenerating: false,
        aiError: e instanceof Error ? e.message : String(e),
      });
    }
  },

  clearIllustration: () =>
    set((s) => ({
      config: {
        ...s.config,
        illustration: { url: null, position: null },
      },
    })),
}));

// 初始化时加载默认资源
useCopybookStore.getState().setResource(DEFAULT_CONFIG.resourceId);
