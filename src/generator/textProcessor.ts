// 文本处理：清洗、提取汉字

/** 是否为 CJK 统一汉字（基本区 + 扩展 A 区常用部分） */
export function isHanzi(ch: string): boolean {
  if (!ch) return false;
  const code = ch.codePointAt(0);
  if (code === undefined) return false;
  // CJK 统一汉字基本区 4E00–9FFF
  // CJK 扩展 A 区 3400–4DBF
  // CJK 兼容 ideograph F900–FAFF
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

/** 常见的中英文标点符号正则表达式 */
const PUNCTUATION_REGEX = /^[，。！？、：；“”‘’（）《》〈〉【】『』「」〔〕…—·,.!?:;"'()[\]{}]$/;

export function isPunctuation(ch: string): boolean {
  return PUNCTUATION_REGEX.test(ch);
}

/** 提取目标字符（汉字，可选择是否包含标点） */
export function extractHanzi(text: string, includePunctuation: boolean = false): string[] {
  const result: string[] = [];
  for (const ch of text) {
    if (isHanzi(ch) || (includePunctuation && isPunctuation(ch))) {
      result.push(ch);
    }
  }
  return result;
}

/** 标准化：保留汉字与必要空白，多个空白合一 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
