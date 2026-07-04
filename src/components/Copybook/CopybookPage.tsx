import { useMemo } from "react";
import type { CopybookConfig, CopybookPage } from "@/types";
import { getGridStyle } from "./gridStyles";

interface CopybookPageProps {
  page: CopybookPage;
  config: CopybookConfig;
  /** 资源标题（用于扉页与页眉） */
  title: string;
}

/**
 * 单页字帖 SVG 渲染。
 * 横排：行从上到下、字从左到右。
 * 竖排：列从右到左、字从上到下（传统竖写）。
 */
export default function CopybookPageView({
  page,
  config,
  title,
}: CopybookPageProps) {
  const gridStyle = getGridStyle(config.gridStyle);
  const cellSize = config.cellSize;
  const padX = 32;
  const padY = 32;
  const headerH = config.showTitle ? 40 : 0;
  const footerH = 28;

  const { width, height } = useMemo(() => {
    const w = config.charsPerRow * cellSize + padX * 2;
    const h = config.rowsPerPage * cellSize + padY * 2 + headerH + footerH;
    return { width: w, height: h };
  }, [config.charsPerRow, config.rowsPerPage, cellSize, headerH]);

  const renderCell = (
    char: string,
    charTraditional: string,
    rowIdx: number,
    colIdx: number,
  ) => {
    const x =
      config.layout === "vertical-rl"
        ? padX + (config.charsPerRow - 1 - colIdx) * cellSize
        : padX + colIdx * cellSize;
    const y = padY + headerH + rowIdx * cellSize;
    return (
      <g key={`${rowIdx}-${colIdx}`} transform={`translate(${x}, ${y})`}>
        {gridStyle.renderBackground(cellSize)}
        {gridStyle.renderChar(
          {
            simplified: char,
            traditional: charTraditional,
            charset: config.charset,
            layout: config.layout,
          },
          cellSize,
          config.font,
          config.showPinyin,
        )}
      </g>
    );
  };

  // 扉页
  if (page.isTitlePage) {
    const img = config.illustration.url;
    const imgW = width - padX * 2;
    const imgH = height - padY * 2 - 80;
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: "#fff" }}
      >
        <rect x={0} y={0} width={width} height={height} fill="#fdfaf2" />
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
          x={width / 2}
          y={height - padY - 12}
          textAnchor="middle"
          fontFamily={config.font}
          fontSize={32}
          fill="#1f1c18"
          style={{ letterSpacing: "0.4em" }}
        >
          {title}
        </text>
        <text
          x={width - padX}
          y={height - 8}
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
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: "#fff" }}
    >
      <rect x={0} y={0} width={width} height={height} fill="#fdfaf2" />

      {/* 页眉标题 */}
      {config.showTitle && (
        <text
          x={width / 2}
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
            x={width - padX - 64}
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
            y={height - footerH - 2}
            width={120}
            height={footerH}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.9}
          />
        )}

      {/* 字格 */}
      {page.cells.map((row, rIdx) =>
        row.map((cell, cIdx) =>
          renderCell(cell.char, cell.charTraditional, rIdx, cIdx),
        ),
      )}

      {/* 页脚 */}
      <text
        x={padX}
        y={height - 10}
        fontSize={11}
        fill="rgba(31,28,24,0.45)"
      >
        {title}
      </text>
      <text
        x={width - padX}
        y={height - 10}
        textAnchor="end"
        fontSize={11}
        fill="rgba(31,28,24,0.45)"
      >
        第 {page.index + 1} 页
      </text>
    </svg>
  );
}
