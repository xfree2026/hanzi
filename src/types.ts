// 字帖生成器核心类型定义

/** 文本分类：蒙学 / 诗词 / 中医 / 经部 / 算学 / 天文 / 道家 */
export type ResourceCategory =
  | "primer"
  | "poetry"
  | "medicine"
  | "classics"
  | "mathematics"
  | "astronomy"
  | "daoist";

/** 内置文本资源 */
export interface TextResource {
  id: string;
  title: string;
  category: ResourceCategory;
  author?: string;
  description: string;
  /** 静态文件相对路径，位于 public/resources */
  file: string;
}

/** 字格样式 ID */
export type GridStyleId =
  | "tian"
  | "mi"
  | "jiugong"
  | "miaohong"
  | "lunkuo"
  | "shixin"
  | "blank";

/** 版式 */
export type LayoutMode = "horizontal-lr" | "vertical-rl";

/** 字符集模式：自动(保持原文) / 简体 / 繁体 / 简繁对照 */
export type CharsetMode = "auto" | "simplified" | "traditional" | "bilingual";

/** AI 配图风格预设 */
export type IllustrationStyle =
  | "ink"
  | "gongbi"
  | "line"
  | "woodblock";

/** AI 配图插入位置 */
export type IllustrationPosition =
  | "header"
  | "footer"
  | "title-page"
  | null;

/** 字帖配置 */
export interface CopybookConfig {
  resourceId: string | null;
  customText: string;
  /** 当前选用的资源原始文本（运行时从资源加载或自定义） */
  sourceText: string;
  gridStyle: GridStyleId;
  layout: LayoutMode;
  /** 字符集模式：自动 / 简体 / 繁体 / 简繁对照 */
  charset: CharsetMode;
  charsPerRow: number;
  rowsPerPage: number;
  cellSize: number;
  font: string;
  showPinyin: boolean;
  showTitle: boolean;
  /** 是否保留标点符号 */
  includePunctuation: boolean;
  /** 启用笔画展开模式 */
  enableStroke: boolean;
  /** 笔画模式的起始字符索引 */
  strokeStartIndex: number;
  /** 纸张背景色（null 表示白色/无背景色） */
  backgroundColor: string | null;
  /** 笔画模式字数限制，避免性能卡顿 */
  bihuaLimit: number;
  illustration: {
    url: string | null;
    position: IllustrationPosition;
  };
}

/** 单字格信息 */
export interface Cell {
  /** 简体字（auto / simplified 模式使用） */
  char: string;
  /** 繁体字（traditional / bilingual 模式使用，可与 char 相同） */
  charTraditional: string;
  /** 在资源中的字符序号，便于显示笔画信息 */
  index: number;
  /** 是否占位空格 */
  placeholder: boolean;
  /** bilingual 模式下该字格显示简体还是繁体（其他模式为 null） */
  bilingualDisplay: "simplified" | "traditional" | null;
  /** 笔画模式：当前显示到第几笔（1-based） */
  strokeStep?: number;
  /** 笔画模式：该字总笔画数 */
  strokeTotal?: number;
}

/** 单页字帖 */
export interface CopybookPage {
  index: number;
  cells: Cell[][];
  /** 该页是否为扉页（含插图） */
  isTitlePage: boolean;
}

/** 字模渲染所需信息 */
export interface CharRenderInput {
  /** 简体字模 */
  simplified: string;
  /** 繁体字模（auto 模式下与 simplified 相同） */
  traditional: string;
  /** 字符集模式 */
  charset: CharsetMode;
  /** 排版方向：影响 bilingual 对照的分隔方向（横排上下 / 竖排左右） */
  layout: LayoutMode;
  /** bilingual 模式下该字格显示简体还是繁体（其他模式为 null） */
  bilingualDisplay: "simplified" | "traditional" | null;
  /** 笔画模式：SVG 笔画路径数组 */
  strokePaths?: string[];
  /** 笔画模式：当前显示到第几笔（1-based） */
  strokeStep?: number;
  /** 笔画模式：总笔画数 */
  strokeTotal?: number;
}

/** 字格样式接口（插件化） */
export interface GridStyle {
  id: GridStyleId;
  name: string;
  description: string;
  /** 渲染字格底纹（位于每个字格内） */
  renderBackground: (size: number, offsetX: number, offsetY: number) => JSX.Element;
  /** 渲染字模 */
  renderChar: (
    input: CharRenderInput,
    size: number,
    font: string,
    showPinyin: boolean,
    offsetX: number,
    offsetY: number,
  ) => JSX.Element;
}
