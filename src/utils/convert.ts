// 简繁体转换工具
// 基于 simplebig 字典库，纯前端运行

import { s2t, t2s } from "simplebig";

/** 字符集模式 */
export type CharsetMode = "auto" | "simplified" | "traditional" | "bilingual";

/**
 * 将文本按字符集模式转换。
 * - auto：保持原文（资源库默认即简体）
 * - simplified：转为简体
 * - traditional：转为繁体
 * - bilingual：返回 [简体, 繁体] 用于对照显示
 */
export function convertText(
  text: string,
  mode: CharsetMode,
): string | { simplified: string; traditional: string } {
  switch (mode) {
    case "simplified":
      return t2s(text);
    case "traditional":
      return s2t(text);
    case "bilingual": {
      // 以原文为基准，再生成对应版本
      const simplified = t2s(text);
      const traditional = s2t(text);
      return { simplified, traditional };
    }
    case "auto":
    default:
      return text;
  }
}

/** 按字符集模式取单个字符（对照模式返回简/繁两字） */
export function convertChar(
  ch: string,
  mode: CharsetMode,
): string | { simplified: string; traditional: string } {
  if (!ch) return "";
  switch (mode) {
    case "simplified":
      return t2s(ch);
    case "traditional":
      return s2t(ch);
    case "bilingual":
      return { simplified: t2s(ch), traditional: s2t(ch) };
    case "auto":
    default:
      return ch;
  }
}
