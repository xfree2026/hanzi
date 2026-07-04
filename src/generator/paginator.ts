import type { Cell, CopybookConfig, CopybookPage } from "@/types";
import { extractHanzi } from "./textProcessor";
import { s2t, t2s } from "@/utils/dict";

/**
 * 字帖分页算法。
 *
 * 横排：每行从左到右填字，行从上到下排列，填满 rowsPerPage 行后换页。
 * 竖排：每列从上到下填字，列从右到左排列（传统书页式），填满 charsPerRow 列后换页。
 *
 * 当配置 illustration.position === 'title-page' 时，首页作为扉页（仅放插图与标题，不放字格）。
 *
 * 字符集模式处理：
 * - auto：保持原文，char 与 charTraditional 相同
 * - simplified：原文 → 简体，char 即简体，charTraditional 为对应的繁体（供对照参考）
 * - traditional：原文 → 繁体，charTraditional 即繁体，char 为对应的简体
 * - bilingual：简繁对照 —— 每个字符占两个字格
 *   - 横排：第 0 行简体、第 1 行繁体（同字符），第 2 行简体、第 3 行繁体……
 *   - 竖排：第 0 列简体、第 1 列繁体（同字符），第 2 列简体、第 3 列繁体……
 */
export function paginate(config: CopybookConfig): CopybookPage[] {
  const sourceChars = extractHanzi(config.sourceText);
  const { charsPerRow, rowsPerPage, charset, layout } = config;

  // 预处理字符：每字生成 {简, 繁}
  const chars: { simplified: string; traditional: string }[] = [];
  for (const ch of sourceChars) {
    const simp = t2s(ch);
    const trad = s2t(ch);
    chars.push({ simplified: simp, traditional: trad });
  }

  // 扉页
  const hasTitlePage =
    config.showTitle &&
    config.illustration.position === "title-page" &&
    !!config.illustration.url;

  const pages: CopybookPage[] = [];
  let cursor = 0;

  if (hasTitlePage) {
    pages.push({ index: 0, cells: [], isTitlePage: true });
  }

  /**
   * 构建 placeholder cell。
   */
  const emptyCell = (display: Cell["bilingualDisplay"]): Cell => ({
    char: "",
    charTraditional: "",
    index: -1,
    placeholder: true,
    bilingualDisplay: display,
  });

  /**
   * bilingual 模式下，按"组"取字符：
   * - 横排：每组 = 一简行 + 一繁行 = 2 行 × charsPerRow 字
   *   组 g 的简体行 = 第 2g 行，繁体行 = 第 2g+1 行
   *   组 g 第 c 个字符的源序号 = g * charsPerRow + c
   * - 竖排：每组 = 一简列 + 一繁列 = 2 列 × rowsPerPage 字
   *   组 g 的简体列 = 第 2g 列，繁体列 = 第 2g+1 列
   *   组 g 第 r 个字符的源序号 = g * rowsPerPage + r
   *
   * 每页可容纳字符数（即组数 × 单组字数 / 2，因为每字占两格）：
   * - 横排：floor(rowsPerPage / 2) * charsPerRow
   * - 竖排：floor(charsPerRow / 2) * rowsPerPage
   */
  const bilingualGroupsPerPage =
    layout === "vertical-rl"
      ? Math.floor(charsPerRow / 2)
      : Math.floor(rowsPerPage / 2);
  const bilingualGroupSize =
    layout === "vertical-rl" ? rowsPerPage : charsPerRow;
  const bilingualCharsPerPage = bilingualGroupsPerPage * bilingualGroupSize;

  while (cursor < chars.length) {
    const cells: Cell[][] = [];

    if (charset === "bilingual") {
      // === bilingual 模式：行/列交替简繁 ===
      if (layout === "vertical-rl") {
        // 竖排：每两列一组（简列 + 繁列），列从右到左
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          for (let c = 0; c < charsPerRow; c++) {
            // 列 c 对应的实际列序号（从右到左）：actualCol = charsPerRow - 1 - c
            const actualCol = charsPerRow - 1 - c;
            const groupIdx = Math.floor(actualCol / 2);
            const isTradCell = actualCol % 2 === 1; // 奇数列 = 繁体
            const charIdxInGroup = r;
            const sourceIdx = groupIdx * bilingualGroupSize + charIdxInGroup;
            const src = chars[sourceIdx];
            if (src) {
              row.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: sourceIdx,
                placeholder: false,
                bilingualDisplay: isTradCell ? "traditional" : "simplified",
              });
            } else {
              row.push(emptyCell(isTradCell ? "traditional" : "simplified"));
            }
          }
          cells.push(row);
        }
        cursor += bilingualCharsPerPage;
      } else {
        // 横排：每两行一组（简行 + 繁行）
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          const groupIdx = Math.floor(r / 2);
          const isTradCell = r % 2 === 1; // 奇数行 = 繁体
          for (let c = 0; c < charsPerRow; c++) {
            const sourceIdx = groupIdx * bilingualGroupSize + c;
            const src = chars[sourceIdx];
            if (src) {
              row.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: sourceIdx,
                placeholder: false,
                bilingualDisplay: isTradCell ? "traditional" : "simplified",
              });
            } else {
              row.push(emptyCell(isTradCell ? "traditional" : "simplified"));
            }
          }
          cells.push(row);
        }
        cursor += bilingualCharsPerPage;
      }
    } else {
      // === 非 bilingual：常规分页 ===
      const perPage = charsPerRow * rowsPerPage;
      const slice = chars.slice(cursor, cursor + perPage);

      for (let r = 0; r < rowsPerPage; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < charsPerRow; c++) {
          if (layout === "vertical-rl") {
            // 竖排：按列优先切片
            const charIdx = c * rowsPerPage + r;
            const ch = slice[charIdx];
            if (ch !== undefined) {
              row.push({
                char: ch.simplified,
                charTraditional: ch.traditional,
                index: cursor + charIdx,
                placeholder: false,
                bilingualDisplay: null,
              });
            } else {
              row.push(emptyCell(null));
            }
          } else {
            const idx = r * charsPerRow + c;
            const ch = slice[idx];
            if (ch !== undefined) {
              row.push({
                char: ch.simplified,
                charTraditional: ch.traditional,
                index: cursor + idx,
                placeholder: false,
                bilingualDisplay: null,
              });
            } else {
              row.push(emptyCell(null));
            }
          }
        }
        cells.push(row);
      }
      cursor += perPage;
    }

    pages.push({ index: pages.length, cells, isTitlePage: false });
  }

  if (pages.length === 0 || (hasTitlePage && pages.length === 1)) {
    pages.push({
      index: pages.length,
      cells: Array.from({ length: rowsPerPage }, () =>
        Array.from({ length: charsPerRow }, () => emptyCell(null)),
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
