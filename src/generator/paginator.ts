import type { Cell, CopybookConfig, CopybookPage } from "@/types";
import { extractHanzi } from "./textProcessor";
import { s2t, t2s } from "@/utils/dict";
import type { StrokeData } from "@/utils/strokeData";

/**
 * 字帖分页算法。
 *
 * 横排：每行从左到右填字，行从上到下排列，填满 rowsPerPage 行后换页。
 * 竖排：每列从上到下填字，列从右到左排列（传统竖写），填满 charsPerRow 列后换页。
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
 *
 * 笔画模式（gridStyle === 'bihua'）：
 * - 每个字按笔画数展开为 N+1 个格子（N笔逐步 + 1个完整字）
 * - 需要传入 strokeDataMap 来获取每个字的笔画数
 */
export function paginate(
  config: CopybookConfig,
  strokeDataMap?: Map<string, StrokeData>,
): CopybookPage[] {
  const sourceChars = extractHanzi(config.sourceText);
  const { charsPerRow, rowsPerPage, charset, layout, gridStyle } = config;

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

  // ===== 笔画模式 =====
  if (gridStyle === "bihua" && strokeDataMap && strokeDataMap.size > 0) {
    // 笔画模式：每个字展开为 strokeCount + 1 个格子
    // 生成扁平化的 Cell 列表，再按行列分页
    const expandedCells: Cell[] = [];
    const limit = config.bihuaLimit ?? 12;
    const charsToProcess = chars.slice(0, limit);
    
    for (let i = 0; i < charsToProcess.length; i++) {
      const ch = charsToProcess[i];
      const displayChar =
        charset === "traditional"
          ? ch.traditional || ch.simplified
          : ch.simplified || ch.traditional;
      const strokeData = strokeDataMap.get(displayChar);
      const strokeCount = strokeData?.strokes.length ?? 0;

      if (strokeCount > 0) {
        // 逐笔增加的格子
        for (let step = 1; step <= strokeCount; step++) {
          expandedCells.push({
            char: ch.simplified,
            charTraditional: ch.traditional,
            index: i,
            placeholder: false,
            bilingualDisplay: null,
            strokeStep: step,
            strokeTotal: strokeCount,
          });
        }
      } else {
        // 无笔画数据，显示一个完整字格
        expandedCells.push({
          char: ch.simplified,
          charTraditional: ch.traditional,
          index: i,
          placeholder: false,
          bilingualDisplay: null,
        });
      }
    }

    // 按行列填充到页面
    const perPage = charsPerRow * rowsPerPage;
    let cursor = 0;
    while (cursor < expandedCells.length) {
      const cells: Cell[][] = [];
      if (layout === "vertical-rl") {
        // 竖排：按列优先填充
        const colCells: Cell[][] = [];
        for (let c = 0; c < charsPerRow && cursor < expandedCells.length; c++) {
          const col: Cell[] = [];
          for (let r = 0; r < rowsPerPage && cursor < expandedCells.length; r++) {
            col.push(expandedCells[cursor++]);
          }
          // 补齐不足的行
          while (col.length < rowsPerPage) col.push(emptyCell(null));
          colCells.push(col);
        }
        // 补齐不足的列
        while (colCells.length < charsPerRow) {
          colCells.push(Array.from({ length: rowsPerPage }, () => emptyCell(null)));
        }
        // 转置为 cells[row][col]，列顺序不变（渲染时会反转）
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          for (let c = 0; c < charsPerRow; c++) {
            row.push(colCells[c][r]);
          }
          cells.push(row);
        }
      } else {
        // 横排：按行优先填充
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          for (let c = 0; c < charsPerRow; c++) {
            if (cursor < expandedCells.length) {
              row.push(expandedCells[cursor++]);
            } else {
              row.push(emptyCell(null));
            }
          }
          cells.push(row);
        }
      }
      pages.push({ index: pages.length, cells, isTitlePage: false });
    }
  } else if (charset === "bilingual") {
    // ===== bilingual 模式 =====
    let cursor = 0;
    const bilingualGroupsPerPage =
      layout === "vertical-rl"
        ? Math.floor(charsPerRow / 2)
        : Math.floor(rowsPerPage / 2);
    const bilingualGroupSize =
      layout === "vertical-rl" ? rowsPerPage : charsPerRow;
    const bilingualCharsPerPage = bilingualGroupsPerPage * bilingualGroupSize;

    while (cursor < chars.length) {
      const cells: Cell[][] = [];

      if (layout === "vertical-rl") {
        // 竖排：每两列一组（简列 + 繁列），列从右到左
        // 生成按列排列的数据，然后转置
        const groupCount = Math.floor(charsPerRow / 2);
        const colData: Cell[][] = [];
        for (let g = 0; g < groupCount; g++) {
          const simpCol: Cell[] = [];
          const tradCol: Cell[] = [];
          for (let r = 0; r < rowsPerPage; r++) {
            const sourceIdx = cursor + g * bilingualGroupSize + r;
            const src = chars[sourceIdx];
            if (src) {
              simpCol.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: sourceIdx,
                placeholder: false,
                bilingualDisplay: "simplified",
              });
              tradCol.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: sourceIdx,
                placeholder: false,
                bilingualDisplay: "traditional",
              });
            } else {
              simpCol.push(emptyCell("simplified"));
              tradCol.push(emptyCell("traditional"));
            }
          }
          // 简体列在右（先push），繁体列在左（后push）
          colData.push(simpCol);
          colData.push(tradCol);
        }
        // 补齐不足的列
        while (colData.length < charsPerRow) {
          colData.push(Array.from({ length: rowsPerPage }, () => emptyCell(null)));
        }
        // 转置为 cells[row][col]
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          for (let c = 0; c < charsPerRow; c++) {
            row.push(colData[c][r]);
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
            const sourceIdx = cursor + groupIdx * bilingualGroupSize + c;
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

      pages.push({ index: pages.length, cells, isTitlePage: false });
    }
  } else {
    // ===== 常规模式（非 bilingual、非笔画） =====
    let cursor = 0;
    const perPage = charsPerRow * rowsPerPage;

    while (cursor < chars.length) {
      const cells: Cell[][] = [];
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
      pages.push({ index: pages.length, cells, isTitlePage: false });
    }
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
