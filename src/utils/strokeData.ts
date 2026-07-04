/**
 * 汉字笔画数据加载器。
 *
 * 数据来源：hanzi-writer-data (CDN via jsDelivr)
 * 坐标系：1024×1024，Y 轴向上为正，范围约 (0, -124) → (1024, 900)
 */

/** 单字笔画数据 */
export interface StrokeData {
  /** 每笔 SVG path 字符串 */
  strokes: string[];
  /** 每笔中心线坐标 */
  medians: number[][][];
}

const CDN_BASE = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0";

/** 内存缓存 */
const cache = new Map<string, StrokeData>();

/** 正在请求的 Promise（避免重复请求同一个字） */
const pending = new Map<string, Promise<StrokeData>>();

/**
 * 获取单个汉字的笔画数据。
 * 带内存缓存和去重逻辑。
 */
export async function fetchStrokeData(char: string): Promise<StrokeData | null> {
  // 缓存命中
  if (cache.has(char)) return cache.get(char)!;
  // 正在请求中
  if (pending.has(char)) return pending.get(char)!;

  const promise = (async () => {
    try {
      const url = `${CDN_BASE}/${encodeURIComponent(char)}.json`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data: StrokeData = await resp.json();
      cache.set(char, data);
      return data;
    } catch {
      return null;
    } finally {
      pending.delete(char);
    }
  })();

  pending.set(char, promise as Promise<StrokeData>);
  return promise;
}

/**
 * 批量预加载多个汉字的笔画数据。
 * 返回 Map<字符, StrokeData>，加载失败的字符不包含在结果中。
 */
export async function preloadStrokes(
  chars: string[],
): Promise<Map<string, StrokeData>> {
  // 去重
  const unique = [...new Set(chars)];
  const results = await Promise.all(unique.map(fetchStrokeData));
  const map = new Map<string, StrokeData>();
  unique.forEach((ch, i) => {
    const data = results[i];
    if (data) map.set(ch, data);
  });
  return map;
}

/**
 * 同步获取已缓存的笔画数据（仅在已预加载后使用）。
 */
export function getCachedStrokeData(char: string): StrokeData | null {
  return cache.get(char) ?? null;
}
