import { useMemo } from "react";
import type { CopybookConfig, CopybookPage } from "@/types";
import { getGridStyle } from "./gridStyles";
import type { StrokeData } from "@/utils/strokeData";

interface CopybookPageProps {
  page: CopybookPage;
  config: CopybookConfig;
  /** 资源标题（用于扉页与页眉） */
  title: string;
  /** 响应式铺满父容器（打印时使用，SVG 用 100% 宽高 + preserveAspectRatio） */
  responsive?: boolean;
  /** 笔画数据（笔画模式使用） */
  strokeDataMap?: Map<string, StrokeData>;
}

/**
 * 单页字帖 SVG 渲染。
 * 横排：行从上到下、字从左到右。
 * 竖排：列从右到左、字从上到下（传统竖写）。
 *
 * viewBox 按 A4 纸比例（210:297）计算，字格区域居中放置，
 * 背景色覆盖整个 viewBox，确保全页填充无白边。
 */
export default function CopybookPageView({
  page,
  config,
  title,
  responsive = false,
  strokeDataMap,
}: CopybookPageProps) {
  const gridStyle = getGridStyle(config.gridStyle);
  const cellSize = config.cellSize;

  // 字格区域尺寸
  const gridW = config.charsPerRow * cellSize;
  const gridH = config.rowsPerPage * cellSize;

  const headerH = config.showTitle ? 40 : 0;
  const footerH = 28;

  // 使用 A4 比例的 viewBox，字格区域居中
  const { vbWidth, vbHeight, padX, padY } = useMemo(() => {
    // 字格 + 页眉页脚所需的最小内容高度
    const contentH = gridH + headerH + footerH;
    const contentW = gridW;

    // A4 比例 = 210:297
    const a4Ratio = 210 / 297;

    // 根据内容尺寸计算 A4 比例的 viewBox
    // 以内容的宽或高为基准，取较大的那个以确保内容不超出
    // 为避免浏览器的物理不可打印区域截断页眉页脚，留出充足的最小边距 (96px)
    let w: number, h: number;
    if (contentW / contentH > a4Ratio) {
      // 内容偏宽：以宽度为基准
      w = contentW + 96; 
      h = w / a4Ratio;
    } else {
      // 内容偏高：以高度为基准
      h = contentH + 96; 
      w = h * a4Ratio;
    }

    // 计算居中的内边距
    const px = (w - contentW) / 2;
    const py = (h - contentH) / 2;

    return { vbWidth: w, vbHeight: h, padX: px, padY: py };
  }, [gridW, gridH, headerH, footerH]);

  const bgColor = config.backgroundColor ?? "#fff";

  const renderCell = (
    char: string,
    charTraditional: string,
    rowIdx: number,
    colIdx: number,
    bilingualDisplay: "simplified" | "traditional" | null,
    strokeStep?: number,
    strokeTotal?: number,
  ) => {
    const x =
      config.layout === "vertical-rl"
        ? padX + (config.charsPerRow - 1 - colIdx) * cellSize
        : padX + colIdx * cellSize;
    const y = padY + headerH + rowIdx * cellSize;

    // bilingual 模式下繁体行/列背景色微调（沉香淡黄褐）
    const bgRect =
      bilingualDisplay === "traditional" ? (
        <rect
          x={x}
          y={y}
          width={cellSize}
          height={cellSize}
          fill="rgba(176, 141, 87, 0.10)"
        />
      ) : null;

    // 获取笔画路径数据
    const displayChar =
      config.charset === "traditional"
        ? charTraditional || char
        : char || charTraditional;
    const strokeData = strokeDataMap?.get(displayChar);
    const strokePaths = strokeData?.strokes;

    // 不再使用 <g transform> 以避免在打印模式下因渲染引擎 Bug 导致坐标失效，直接使用绝对坐标
    return (
      <g key={`${rowIdx}-${colIdx}`}>
        {bgRect}
        {gridStyle.renderBackground(cellSize, x, y)}
        {gridStyle.renderChar(
          {
            simplified: char,
            traditional: charTraditional,
            charset: config.charset,
            layout: config.layout,
            bilingualDisplay,
            strokePaths,
            strokeStep,
            strokeTotal,
          },
          cellSize,
          config.font,
          config.showPinyin,
          x,
          y
        )}
      </g>
    );
  };

  // 扉页
  if (page.isTitlePage) {
    const img = config.illustration.url;
    const imgW = vbWidth - padX * 2;
    const imgH = vbHeight - padY * 2 - 80;
    return (
      <svg
        width={responsive ? "100%" : vbWidth}
        height={responsive ? "100%" : vbHeight}
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <rect x={0} y={0} width={vbWidth} height={vbHeight} fill={bgColor} />
        {img && (
          <image
            href={img}
            x={padX}
            y={padY}
            width={imgW}
            height={imgH}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        <text
          x={vbWidth / 2}
          y={vbHeight - padY - 12}
          textAnchor="middle"
          fontFamily={config.font}
          fontSize={32}
          fill="#1f1c18"
          style={{ letterSpacing: "0.4em" }}
        >
          {title}
        </text>
        <text
          x={vbWidth - padX}
          y={vbHeight - 8}
          textAnchor="end"
          fontSize={11}
          fill="rgba(31,28,24,0.45)"
        >
          翰墨字帖 · 扉页
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={responsive ? "100%" : vbWidth}
      height={responsive ? "100%" : vbHeight}
      viewBox={`0 0 ${vbWidth} ${vbHeight}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect x={0} y={0} width={vbWidth} height={vbHeight} fill={bgColor} />

      {/* 页眉标题 */}
      {config.showTitle && (
        <text
          x={vbWidth / 2}
          y={padY + headerH / 2 + 4}
          textAnchor="middle"
          fontFamily={config.font}
          fontSize={20}
          fill="#2a2620"
          style={{ letterSpacing: "0.3em" }}
        >
          {title}
        </text>
      )}

      {/* 页眉/页脚插图 */}
      {config.illustration.url &&
        config.illustration.position === "header" && (
          <image
            href={config.illustration.url}
            x={vbWidth - padX - 64}
            y={8}
            width={64}
            height={headerH || 40}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.92}
          />
        )}
      {config.illustration.url &&
        config.illustration.position === "footer" && (
          <image
            href={config.illustration.url}
            x={padX}
            y={vbHeight - footerH - 2}
            width={120}
            height={footerH}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.9}
          />
        )}

      {/* 字格 */}
      {page.cells.map((row, rIdx) =>
        row.map((cell, cIdx) =>
          renderCell(
            cell.char,
            cell.charTraditional,
            rIdx,
            cIdx,
            cell.bilingualDisplay,
            cell.strokeStep,
            cell.strokeTotal,
          ),
        ),
      )}

      {/* 页脚 */}
      <text
        x={padX}
        y={vbHeight - 10}
        fontSize={11}
        fill="rgba(31,28,24,0.45)"
      >
        {title}
      </text>
      <text
        x={vbWidth - padX}
        y={vbHeight - 10}
        textAnchor="end"
        fontSize={11}
        fill="rgba(31,28,24,0.45)"
      >
        第 {page.index + 1} 页
      </text>
    </svg>
  );
}
