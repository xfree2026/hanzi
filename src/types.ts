// 字帖生成器核心类型定义

/** 文本分类：蒙学 / 诗词 / 中医 */
export type ResourceCategory = "primer" | "poetry" | "medicine";

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
  charsPerRow: number;
  rowsPerPage: number;
  cellSize: number;
  font: string;
  showPinyin: boolean;
  showTitle: boolean;
  illustration: {
    url: string | null;
    position: IllustrationPosition;
  };
}

/** 单字格信息 */
export interface Cell {
  char: string;
  /** 在资源中的字符序号，便于显示笔画信息 */
  index: number;
  /** 是否占位空格 */
  placeholder: boolean;
}

/** 单页字帖 */
export interface CopybookPage {
  index: number;
  cells: Cell[][];
  /** 该页是否为扉页（含插图） */
  isTitlePage: boolean;
}

/** 字格样式接口（插件化） */
export interface GridStyle {
  id: GridStyleId;
  name: string;
  description: string;
  /** 渲染字格底纹（位于每个字格内） */
  renderBackground: (size: number) => JSX.Element;
  /** 渲染字模 */
  renderChar: (
    char: string,
    size: number,
    font: string,
    showPinyin: boolean,
  ) => JSX.Element;
}
