import type { Cell, CopybookConfig, CopybookPage } from "@/types";
import { extractHanzi } from "./textProcessor";
import { s2t, t2s } from "@/utils/dict";
import type { StrokeData } from "@/utils/strokeData";

interface ExpandedChar {
  simplified: string;
  traditional: string;
  index: number;
  strokeStepSimp?: number;
  strokeTotalSimp?: number;
  strokeStepTrad?: number;
  strokeTotalTrad?: number;
}

export function paginate(
  config: CopybookConfig,
  strokeDataMap?: Map<string, StrokeData>,
): CopybookPage[] {
  const sourceChars = extractHanzi(config.sourceText, config.includePunctuation);
  const { charsPerRow, rowsPerPage, charset, layout } = config;

  // 1. 生成基础字符数组
  const baseChars = sourceChars.map((ch, i) => ({
    simplified: t2s(ch) || ch,
    traditional: s2t(ch) || ch,
    index: i,
  }));

  // 2. 如果开启了笔画模式，将字符数组展开
  let items: ExpandedChar[] = [];
  if (config.enableStroke && strokeDataMap && strokeDataMap.size > 0) {
    const limit = config.bihuaLimit ?? 12;
    const start = config.strokeStartIndex ?? 0;
    const charsToProcess = baseChars.slice(start, start + limit);

    for (const ch of charsToProcess) {
      const countSimp = strokeDataMap.get(ch.simplified)?.strokes.length ?? 0;
      const countTrad = strokeDataMap.get(ch.traditional)?.strokes.length ?? 0;

      let maxSteps = 0;
      if (charset === "bilingual") {
        maxSteps = Math.max(countSimp, countTrad);
      } else if (charset === "traditional") {
        maxSteps = countTrad;
      } else {
        maxSteps = countSimp;
      }

      if (maxSteps > 0) {
        for (let step = 1; step <= maxSteps; step++) {
          items.push({
            ...ch,
            strokeStepSimp: Math.min(step, countSimp),
            strokeTotalSimp: countSimp,
            strokeStepTrad: Math.min(step, countTrad),
            strokeTotalTrad: countTrad,
          });
        }
      } else {
        items.push({ ...ch });
      }
    }
  } else {
    items = baseChars;
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

  const emptyCell = (display: Cell["bilingualDisplay"]): Cell => ({
    char: "",
    charTraditional: "",
    index: -1,
    placeholder: true,
    bilingualDisplay: display,
  });

  // 3. 执行布局算法
  if (charset === "bilingual") {
    // ===== bilingual 模式 =====
    let cursor = 0;
    const bilingualGroupsPerPage =
      layout === "vertical-rl"
        ? Math.floor(charsPerRow / 2)
        : Math.floor(rowsPerPage / 2);
    const bilingualGroupSize =
      layout === "vertical-rl" ? rowsPerPage : charsPerRow;
    const bilingualCharsPerPage = bilingualGroupsPerPage * bilingualGroupSize;

    while (cursor < items.length) {
      const cells: Cell[][] = [];

      if (layout === "vertical-rl") {
        const groupCount = Math.floor(charsPerRow / 2);
        const colData: Cell[][] = [];
        for (let g = 0; g < groupCount; g++) {
          const simpCol: Cell[] = [];
          const tradCol: Cell[] = [];
          for (let r = 0; r < rowsPerPage; r++) {
            const sourceIdx = cursor + g * bilingualGroupSize + r;
            const src = items[sourceIdx];
            if (src) {
              simpCol.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: src.index,
                placeholder: false,
                bilingualDisplay: "simplified",
                strokeStep: src.strokeStepSimp,
                strokeTotal: src.strokeTotalSimp,
              });
              tradCol.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: src.index,
                placeholder: false,
                bilingualDisplay: "traditional",
                strokeStep: src.strokeStepTrad,
                strokeTotal: src.strokeTotalTrad,
              });
            } else {
              simpCol.push(emptyCell("simplified"));
              tradCol.push(emptyCell("traditional"));
            }
          }
          colData.push(simpCol);
          colData.push(tradCol);
        }
        while (colData.length < charsPerRow) {
          colData.push(Array.from({ length: rowsPerPage }, () => emptyCell(null)));
        }
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          for (let c = 0; c < charsPerRow; c++) {
            row.push(colData[c][r]);
          }
          cells.push(row);
        }
        cursor += bilingualCharsPerPage;
      } else {
        for (let r = 0; r < rowsPerPage; r++) {
          const row: Cell[] = [];
          const groupIdx = Math.floor(r / 2);
          const isTradCell = r % 2 === 1; 
          for (let c = 0; c < charsPerRow; c++) {
            const sourceIdx = cursor + groupIdx * bilingualGroupSize + c;
            const src = items[sourceIdx];
            if (src) {
              row.push({
                char: src.simplified,
                charTraditional: src.traditional,
                index: src.index,
                placeholder: false,
                bilingualDisplay: isTradCell ? "traditional" : "simplified",
                strokeStep: isTradCell ? src.strokeStepTrad : src.strokeStepSimp,
                strokeTotal: isTradCell ? src.strokeTotalTrad : src.strokeTotalSimp,
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
    // ===== 常规模式 =====
    let cursor = 0;
    const perPage = charsPerRow * rowsPerPage;

    while (cursor < items.length) {
      const cells: Cell[][] = [];
      const slice = items.slice(cursor, cursor + perPage);

      for (let r = 0; r < rowsPerPage; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < charsPerRow; c++) {
          if (layout === "vertical-rl") {
            const charIdx = c * rowsPerPage + r;
            const ch = slice[charIdx];
            if (ch !== undefined) {
              row.push({
                char: ch.simplified,
                charTraditional: ch.traditional,
                index: ch.index,
                placeholder: false,
                bilingualDisplay: null,
                strokeStep: charset === "traditional" ? ch.strokeStepTrad : ch.strokeStepSimp,
                strokeTotal: charset === "traditional" ? ch.strokeTotalTrad : ch.strokeTotalSimp,
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
                index: ch.index,
                placeholder: false,
                bilingualDisplay: null,
                strokeStep: charset === "traditional" ? ch.strokeStepTrad : ch.strokeStepSimp,
                strokeTotal: charset === "traditional" ? ch.strokeTotalTrad : ch.strokeTotalSimp,
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

export function computePageSize(config: CopybookConfig) {
  const width = config.charsPerRow * config.cellSize;
  const height = config.rowsPerPage * config.cellSize;
  return { width, height };
}
