// 简繁字典：本地 vendored 自 simplebig@0.0.3（sc.txt/tc.txt）
// 改用 Vite ?raw 直接以字符串内联到 bundle，避免原库 Node 模块（fs/buffer/__dirname）在浏览器报错

import sc from "./sc.txt?raw";
import tc from "./tc.txt?raw";

/** 简体 -> 繁体 */
export function s2t(str: string): string {
  let ret = "";
  for (let i = 0, len = str.length; i < len; i++) {
    const ch = str.charAt(i);
    const idx = sc.indexOf(ch);
    ret += idx === -1 ? ch : tc.charAt(idx);
  }
  return ret;
}

/** 繁体 -> 简体 */
export function t2s(str: string): string {
  let ret = "";
  for (let i = 0, len = str.length; i < len; i++) {
    const ch = str.charAt(i);
    const idx = tc.indexOf(ch);
    ret += idx === -1 ? ch : sc.charAt(idx);
  }
  return ret;
}
