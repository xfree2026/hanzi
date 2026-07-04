import type { CharRenderInput, GridStyle, GridStyleId } from "@/types";

/**
 * 字格样式插件集合。
 *
 * 新增样式只需在此追加一个实现并注册到 GRID_STYLES 即可。
 * 每个样式负责：
 *   - renderBackground：字格底纹（田字格/米字格/九宫格/空白）
 *   - renderChar：字模呈现（描红/轮廓/实心/笔画）
 *
 * 字格底纹与字模组合自由，例如「米字格 + 描红字模」。
 *
 * 字符集模式支持：
 *   - auto / simplified / traditional：单字模渲染
 *   - bilingual：每个字占一个完整字格，由分页算法决定该格显示简还是繁
 *     （横排：行交替简繁；竖排：列交替简繁），繁体格背景色微调以示区分
 *
 * 所有 SVG 属性均使用内联样式，确保打印时样式一致。
 */

// ===== 颜色常量（内联使用，避免依赖 CSS 类） =====
const GRID_STROKE = "rgba(176, 141, 87, 0.55)";
const GRID_MI_STROKE = "rgba(176, 141, 87, 0.35)";
const CHAR_MIAOHONG = "rgba(192, 57, 43, 0.32)";
const CHAR_SHIXIN = "rgba(31, 28, 24, 0.85)";
const CHAR_LUNKUO_STROKE = "rgba(31, 28, 24, 0.5)";
const BIHUA_DONE = "rgba(31, 28, 24, 0.75)";
const BIHUA_CURRENT = "rgba(192, 57, 43, 0.85)";

interface BackgroundRenderer {
  (size: number, ox: number, oy: number): JSX.Element;
}

interface CharRenderer {
  (input: CharRenderInput, size: number, font: string, showPinyin: boolean, ox: number, oy: number): JSX.Element;
}

// ===== 底纹渲染 =====

const blankBackground: BackgroundRenderer = () => <></>;

const tianBackground: BackgroundRenderer = (size, ox, oy) => (
  <g>
    {/* 外框 */}
    <rect
      x={ox}
      y={oy}
      width={size}
      height={size}
      stroke={GRID_STROKE}
      fill="none"
      strokeWidth={1.2}
    />
    {/* 中线（虚线） */}
    <line
      x1={ox + size / 2}
      y1={oy}
      x2={ox + size / 2}
      y2={oy + size}
      stroke={GRID_MI_STROKE}
      fill="none"
      strokeWidth={0.8}
      strokeDasharray="3 3"
    />
    <line
      x1={ox}
      y1={oy + size / 2}
      x2={ox + size}
      y2={oy + size / 2}
      stroke={GRID_MI_STROKE}
      fill="none"
      strokeWidth={0.8}
      strokeDasharray="3 3"
    />
  </g>
);

const miBackground: BackgroundRenderer = (size, ox, oy) => (
  <g>
    <rect
      x={ox}
      y={oy}
      width={size}
      height={size}
      stroke={GRID_STROKE}
      fill="none"
      strokeWidth={1.2}
    />
    {/* 十字中线 */}
    <line
      x1={ox + size / 2}
      y1={oy}
      x2={ox + size / 2}
      y2={oy + size}
      stroke={GRID_MI_STROKE}
      fill="none"
      strokeWidth={0.7}
      strokeDasharray="2 3"
    />
    <line
      x1={ox}
      y1={oy + size / 2}
      x2={ox + size}
      y2={oy + size / 2}
      stroke={GRID_MI_STROKE}
      fill="none"
      strokeWidth={0.7}
      strokeDasharray="2 3"
    />
    {/* 对角线 */}
    <line
      x1={ox}
      y1={oy}
      x2={ox + size}
      y2={oy + size}
      stroke={GRID_MI_STROKE}
      fill="none"
      strokeWidth={0.6}
      strokeDasharray="2 3"
    />
    <line
      x1={ox + size}
      y1={oy}
      x2={ox}
      y2={oy + size}
      stroke={GRID_MI_STROKE}
      fill="none"
      strokeWidth={0.6}
      strokeDasharray="2 3"
    />
  </g>
);

const jiugongBackground: BackgroundRenderer = (size, ox, oy) => {
  const step = size / 3;
  return (
    <g>
      <rect
        x={ox}
        y={oy}
        width={size}
        height={size}
        stroke={GRID_STROKE}
        fill="none"
        strokeWidth={1.2}
      />
      {[1, 2].map((i) => (
        <line
          key={`v${i}`}
          x1={ox + step * i}
          y1={oy}
          x2={ox + step * i}
          y2={oy + size}
          stroke={GRID_MI_STROKE}
          fill="none"
          strokeWidth={0.7}
          strokeDasharray="2 3"
        />
      ))}
      {[1, 2].map((i) => (
        <line
          key={`h${i}`}
          x1={ox}
          y1={oy + step * i}
          x2={ox + size}
          y2={oy + step * i}
          stroke={GRID_MI_STROKE}
          fill="none"
          strokeWidth={0.7}
          strokeDasharray="2 3"
        />
      ))}
      {/* 中心米字辅助 */}
      <line
        x1={ox + size / 2}
        y1={oy}
        x2={ox + size / 2}
        y2={oy + size}
        stroke={GRID_MI_STROKE}
        fill="none"
        strokeWidth={0.5}
        strokeDasharray="1 4"
      />
      <line
        x1={ox}
        y1={oy + size / 2}
        x2={ox + size}
        y2={oy + size / 2}
        stroke={GRID_MI_STROKE}
        fill="none"
        strokeWidth={0.5}
        strokeDasharray="1 4"
      />
    </g>
  );
};

// ===== 字模渲染 =====

/** 决定单字模模式下显示哪个字（简/繁） */
function pickDisplayChar(input: CharRenderInput): string {
  // bilingual 模式下，按字格归属显示简或繁（整格居中，不再分半）
  if (input.charset === "bilingual") {
    return input.bilingualDisplay === "traditional"
      ? input.traditional || input.simplified
      : input.simplified || input.traditional;
  }
  switch (input.charset) {
    case "traditional":
      return input.traditional || input.simplified;
    case "simplified":
    case "auto":
    default:
      return input.simplified || input.traditional;
  }
}

function renderSingleText(
  char: string,
  cellSize: number,
  font: string,
  fillColor: string,
  centerX: number,
  centerY: number,
  availSize: number,
  ox: number,
  oy: number,
  scale = 0.78,
) {
  if (!char) return null;
  const fontSize = availSize * scale;
  return (
    <text
      x={ox + centerX}
      y={oy + centerY + fontSize * 0.36}
      textAnchor="middle"
      fontFamily={font}
      fontSize={fontSize}
      fill={fillColor}
      style={{ userSelect: "none" }}
    >
      {char}
    </text>
  );
}

function renderStrokeText(
  char: string,
  cellSize: number,
  font: string,
  centerX: number,
  centerY: number,
  availSize: number,
  ox: number,
  oy: number,
  scale = 0.78,
) {
  if (!char) return null;
  const fontSize = availSize * scale;
  return (
    <text
      x={ox + centerX}
      y={oy + centerY + fontSize * 0.36}
      textAnchor="middle"
      fontFamily={font}
      fontSize={fontSize}
      stroke={CHAR_LUNKUO_STROKE}
      strokeWidth={1.2}
      fill="none"
      style={{ userSelect: "none", paintOrder: "stroke" }}
    >
      {char}
    </text>
  );
}

const blankChar: CharRenderer = () => <></>;

const shixinChar: CharRenderer = (input, size, font, showPinyin, ox, oy) => {
  const ch = pickDisplayChar(input);
  return renderSingleText(
    ch,
    size,
    font,
    CHAR_SHIXIN,
    size / 2,
    size / 2,
    size,
    ox,
    oy,
  ) as unknown as JSX.Element;
};

const miaohongChar: CharRenderer = (input, size, font, showPinyin, ox, oy) => {
  const ch = pickDisplayChar(input);
  return renderSingleText(
    ch,
    size,
    font,
    CHAR_MIAOHONG,
    size / 2,
    size / 2,
    size,
    ox,
    oy,
  ) as unknown as JSX.Element;
};

const lunkuoChar: CharRenderer = (input, size, font, showPinyin, ox, oy) => {
  const ch = pickDisplayChar(input);
  return renderStrokeText(ch, size, font, size / 2, size / 2, size, ox, oy) as unknown as JSX.Element;
};

// ===== 笔画模式渲染 =====

/**
 * 笔画模式字模渲染器。
 * 使用 hanzi-writer-data 的 SVG path 数据，按笔顺逐笔显示。
 * 坐标系转换：原始数据 1024×1024，Y轴向上，范围 (0,-124)→(1024,900)
 * 转换到 cellSize×cellSize 的 SVG 坐标系（Y轴向下）。
 */
export const bihuaChar: CharRenderer = (input, size, font, showPinyin, ox, oy) => {
  const { strokePaths, strokeStep, strokeTotal } = input;

  // 无笔画数据时回退为空
  if (!strokePaths || !strokeStep || !strokeTotal) {
    return <></>;
  }

  // 留 8% 边距
  const margin = size * 0.08;
  const drawSize = size - 2 * margin;
  const s = drawSize / 1024;

  // 优化：将之前的所有笔画合并为一个 path，以减少 DOM 节点数量，防止海量 DOM 导致页面卡死
  const previousStrokesD = strokePaths.slice(0, strokeStep - 1).join(" ");
  const currentStrokeD = strokePaths[strokeStep - 1];

  return (
    <g>
      {previousStrokesD && (
        <path
          d={previousStrokesD}
          fill={BIHUA_DONE}
          stroke="none"
          transform={`translate(${ox + margin}, ${oy + margin}) scale(${s}, ${-s}) translate(0, -900)`}
        />
      )}
      {currentStrokeD && (
        <path
          d={currentStrokeD}
          fill={BIHUA_CURRENT}
          stroke="none"
          transform={`translate(${ox + margin}, ${oy + margin}) scale(${s}, ${-s}) translate(0, -900)`}
        />
      )}
    </g>
  );
};

// ===== 样式注册表 =====
// 字格底纹与字模可任意组合，这里提供常用预设。

export const GRID_STYLES: GridStyle[] = [
  {
    id: "tian",
    name: "田字格 · 实心字",
    description: "标准田字格底纹 + 实心字模，适合初学临写。",
    renderBackground: tianBackground,
    renderChar: shixinChar,
  },
  {
    id: "mi",
    name: "米字格 · 实心字",
    description: "米字格带对角辅助线 + 实心字模，便于把握结构。",
    renderBackground: miBackground,
    renderChar: shixinChar,
  },
  {
    id: "jiugong",
    name: "九宫格 · 实心字",
    description: "九宫格细分 + 实心字模，结构比例一目了然。",
    renderBackground: jiugongBackground,
    renderChar: shixinChar,
  },
  {
    id: "miaohong",
    name: "米字格 · 描红",
    description: "米字格 + 浅红色字模，依红色笔迹描摹。",
    renderBackground: miBackground,
    renderChar: miaohongChar,
  },
  {
    id: "lunkuo",
    name: "米字格 · 字形轮廓",
    description: "米字格 + 仅字形描边，供中级临摹掌握间架。",
    renderBackground: miBackground,
    renderChar: lunkuoChar,
  },
  {
    id: "shixin",
    name: "田字格 · 黑色字模",
    description: "田字格 + 较深的黑色字模，对临参照。",
    renderBackground: tianBackground,
    renderChar: shixinChar,
  },
  {
    id: "blank",
    name: "空白米字格",
    description: "仅米字格底纹，无字模，自由书写。",
    renderBackground: miBackground,
    renderChar: blankChar,
  },
];

export function getGridStyle(id: GridStyleId): GridStyle {
  return GRID_STYLES.find((s) => s.id === id) ?? GRID_STYLES[1]; // 默认 tian
}
