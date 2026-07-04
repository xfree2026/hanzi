import type { CharRenderInput, GridStyle, GridStyleId } from "@/types";

/**
 * 字格样式插件集合。
 *
 * 新增样式只需在此追加一个实现并注册到 GRID_STYLES 即可。
 * 每个样式负责：
 *   - renderBackground：字格底纹（田字格/米字格/九宫格/空白）
 *   - renderChar：字模呈现（描红/轮廓/实心）
 *
 * 字格底纹与字模组合自由，例如「米字格 + 描红字模」。
 *
 * 字符集模式支持：
 *   - auto / simplified / traditional：单字模渲染
 *   - bilingual：字格分为上下两半，上方简体、下方繁体，中间以细线分隔
 */

interface BackgroundRenderer {
  (size: number): JSX.Element;
}

interface CharRenderer {
  (input: CharRenderInput, size: number, font: string, showPinyin: boolean): JSX.Element;
}

// ===== 底纹渲染 =====

const blankBackground: BackgroundRenderer = () => <></>;

const tianBackground: BackgroundRenderer = (size) => (
  <g>
    {/* 外框 */}
    <rect
      x={0}
      y={0}
      width={size}
      height={size}
      className="cell-grid-stroke"
      strokeWidth={1.2}
    />
    {/* 中线（虚线） */}
    <line
      x1={size / 2}
      y1={0}
      x2={size / 2}
      y2={size}
      className="cell-grid-mi-stroke"
      strokeWidth={0.8}
      strokeDasharray="3 3"
    />
    <line
      x1={0}
      y1={size / 2}
      x2={size}
      y2={size / 2}
      className="cell-grid-mi-stroke"
      strokeWidth={0.8}
      strokeDasharray="3 3"
    />
  </g>
);

const miBackground: BackgroundRenderer = (size) => (
  <g>
    <rect
      x={0}
      y={0}
      width={size}
      height={size}
      className="cell-grid-stroke"
      strokeWidth={1.2}
    />
    {/* 十字中线 */}
    <line
      x1={size / 2}
      y1={0}
      x2={size / 2}
      y2={size}
      className="cell-grid-mi-stroke"
      strokeWidth={0.7}
      strokeDasharray="2 3"
    />
    <line
      x1={0}
      y1={size / 2}
      x2={size}
      y2={size / 2}
      className="cell-grid-mi-stroke"
      strokeWidth={0.7}
      strokeDasharray="2 3"
    />
    {/* 对角线 */}
    <line
      x1={0}
      y1={0}
      x2={size}
      y2={size}
      className="cell-grid-mi-stroke"
      strokeWidth={0.6}
      strokeDasharray="2 3"
    />
    <line
      x1={size}
      y1={0}
      x2={0}
      y2={size}
      className="cell-grid-mi-stroke"
      strokeWidth={0.6}
      strokeDasharray="2 3"
    />
  </g>
);

const jiugongBackground: BackgroundRenderer = (size) => {
  const step = size / 3;
  return (
    <g>
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        className="cell-grid-stroke"
        strokeWidth={1.2}
      />
      {[1, 2].map((i) => (
        <line
          key={`v${i}`}
          x1={step * i}
          y1={0}
          x2={step * i}
          y2={size}
          className="cell-grid-mi-stroke"
          strokeWidth={0.7}
          strokeDasharray="2 3"
        />
      ))}
      {[1, 2].map((i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={step * i}
          x2={size}
          y2={step * i}
          className="cell-grid-mi-stroke"
          strokeWidth={0.7}
          strokeDasharray="2 3"
        />
      ))}
      {/* 中心米字辅助 */}
      <line
        x1={size / 2}
        y1={0}
        x2={size / 2}
        y2={size}
        className="cell-grid-mi-stroke"
        strokeWidth={0.5}
        strokeDasharray="1 4"
      />
      <line
        x1={0}
        y1={size / 2}
        x2={size}
        y2={size / 2}
        className="cell-grid-mi-stroke"
        strokeWidth={0.5}
        strokeDasharray="1 4"
      />
    </g>
  );
};

// ===== 字模渲染 =====

/** 决定单字模模式下显示哪个字（简/繁） */
function pickDisplayChar(input: CharRenderInput): string {
  switch (input.charset) {
    case "traditional":
      return input.traditional || input.simplified;
    case "simplified":
    case "auto":
    case "bilingual":
    default:
      return input.simplified || input.traditional;
  }
}

function renderSingleText(
  char: string,
  size: number,
  font: string,
  className: string,
  cy: number,
  scale = 0.78,
) {
  if (!char) return null;
  const fontSize = size * scale;
  return (
    <text
      x={size / 2}
      y={cy + fontSize * 0.36}
      textAnchor="middle"
      fontFamily={font}
      fontSize={fontSize}
      className={className}
      style={{ userSelect: "none" }}
    >
      {char}
    </text>
  );
}

function renderStrokeText(
  char: string,
  size: number,
  font: string,
  cy: number,
  scale = 0.78,
) {
  if (!char) return null;
  const fontSize = size * scale;
  return (
    <text
      x={size / 2}
      y={cy + fontSize * 0.36}
      textAnchor="middle"
      fontFamily={font}
      fontSize={fontSize}
      className="cell-char-lunkuo"
      strokeWidth={1.2}
      fill="none"
      style={{ userSelect: "none", paintOrder: "stroke" }}
    >
      {char}
    </text>
  );
}

const blankChar: CharRenderer = () => <></>;

const shixinChar: CharRenderer = (input, size, font) => {
  if (input.charset === "bilingual") {
    // 对照：上方简体（深色），下方繁体（深色稍浅）
    const half = size / 2;
    return (
      <g>
        {renderSingleText(
          input.simplified,
          half,
          font,
          "cell-char-shixin",
          0,
          0.7,
        )}
        {renderSingleText(
          input.traditional,
          half,
          font,
          "cell-char-shixin",
          half,
          0.7,
        )}
        {/* 中分隔线 */}
        <line
          x1={4}
          y1={half}
          x2={size - 4}
          y2={half}
          stroke="rgba(192,57,43,0.45)"
          strokeWidth={0.8}
          strokeDasharray="2 2"
        />
      </g>
    ) as unknown as JSX.Element;
  }
  const ch = pickDisplayChar(input);
  return renderSingleText(ch, size, font, "cell-char-shixin", 0) as unknown as JSX.Element;
};

const miaohongChar: CharRenderer = (input, size, font) => {
  if (input.charset === "bilingual") {
    const half = size / 2;
    return (
      <g>
        {renderSingleText(
          input.simplified,
          half,
          font,
          "cell-char-miaohong",
          0,
          0.7,
        )}
        {renderSingleText(
          input.traditional,
          half,
          font,
          "cell-char-miaohong",
          half,
          0.7,
        )}
        <line
          x1={4}
          y1={half}
          x2={size - 4}
          y2={half}
          stroke="rgba(192,57,43,0.45)"
          strokeWidth={0.8}
          strokeDasharray="2 2"
        />
      </g>
    ) as unknown as JSX.Element;
  }
  const ch = pickDisplayChar(input);
  return renderSingleText(ch, size, font, "cell-char-miaohong", 0) as unknown as JSX.Element;
};

const lunkuoChar: CharRenderer = (input, size, font) => {
  if (input.charset === "bilingual") {
    const half = size / 2;
    return (
      <g>
        {renderStrokeText(input.simplified, half, font, 0, 0.7)}
        {renderStrokeText(input.traditional, half, font, half, 0.7)}
        <line
          x1={4}
          y1={half}
          x2={size - 4}
          y2={half}
          stroke="rgba(31,28,24,0.3)"
          strokeWidth={0.6}
          strokeDasharray="2 2"
        />
      </g>
    ) as unknown as JSX.Element;
  }
  const ch = pickDisplayChar(input);
  return renderStrokeText(ch, size, font, 0) as unknown as JSX.Element;
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
  return GRID_STYLES.find((s) => s.id === id) ?? GRID_STYLES[0];
}
