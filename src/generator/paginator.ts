import type { Cell, CopybookConfig, CopybookPage } from "@/types";
import { extractHanzi } from "./textProcessor";

/**
 * 字帖分页算法。
 *
 * 横排：每行从左到右填字，行从上到下排列，填满 rowsPerPage 行后换页。
 * 竖排：每列从上到下填字，列从右到左排列（传统书页式），填满 charsPerRow 列后换页。
 *
 * 当配置 illustration.position === 'title-page' 时，首页作为扉页（仅放插图与标题，不放字格）。
 */
export function paginate(config: CopybookConfig): CopybookPage[] {
  const chars = extractHanzi(config.sourceText);
  const { charsPerRow, rowsPerPage } = config;
  const perPage = charsPerRow * rowsPerPage;

  // 扉页
  const hasTitlePage =
    config.showTitle &&
    config.illustration.position === "title-page" &&
    !!config.illustration.url;

  const pages: CopybookPage[] = [];
  let cursor = 0;

  if (hasTitlePage) {
    pages.push({
      index: 0,
      cells: [],
      isTitlePage: true,
    });
  }

  while (cursor < chars.length) {
    const slice = chars.slice(cursor, cursor + perPage);
    const cells: Cell[][] = [];

    for (let r = 0; r < rowsPerPage; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < charsPerRow; c++) {
        const idx = r * charsPerRow + c;
        if (config.layout === "vertical-rl") {
          // 竖排：按列优先切片
          const charIdx = c * rowsPerPage + r;
          const ch = slice[charIdx];
          if (ch !== undefined) {
            row.push({ char: ch, index: cursor + charIdx, placeholder: false });
          } else {
            row.push({ char: "", index: -1, placeholder: true });
          }
        } else {
          const ch = slice[idx];
          if (ch !== undefined) {
            row.push({ char: ch, index: cursor + idx, placeholder: false });
          } else {
            row.push({ char: "", index: -1, placeholder: true });
          }
        }
      }
      cells.push(row);
    }

    pages.push({
      index: pages.length,
      cells,
      isTitlePage: false,
    });
    cursor += perPage;
  }

  if (pages.length === 0) {
    pages.push({
      index: 0,
      cells: Array.from({ length: rowsPerPage }, () =>
        Array.from({ length: charsPerRow }, () => ({
          char: "",
          index: -1,
          placeholder: true,
        })),
      ),
      isTitlePage: false,
    });
  }

  return pages;
}

/** 计算实际可绘制字格区域尺寸（用于 SVG viewBox） */
export function computePageSize(config: CopybookConfig) {
  const width = config.charsPerRow * config.cellSize;
  const height = config.rowsPerPage * config.cellSize;
  return { width, height };
}
