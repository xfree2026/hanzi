import type { TextResource } from "@/types";

/** 内置资源索引 —— 资源文件位于 public/resources/ */
export const RESOURCES: TextResource[] = [
  {
    id: "san-zi-jing",
    title: "三字经",
    category: "primer",
    author: "宋·王应麟",
    description: "蒙学之首，三字一句，朗朗上口，涵盖常识、伦理、历史、勤学。",
    file: "/resources/三字经.txt",
  },
  {
    id: "bai-jia-xing",
    title: "百家姓",
    category: "primer",
    author: "宋·佚名",
    description: "收录中国常见姓氏，四字一句，韵律齐整，便于记诵。",
    file: "/resources/百家姓.txt",
  },
  {
    id: "qian-zi-wen",
    title: "千字文",
    category: "primer",
    author: "梁·周兴嗣",
    description: "一千字不重，涵盖天文地理、修身治国，历代书家最爱临写之本。",
    file: "/resources/千字文.txt",
  },
  {
    id: "tang-shi",
    title: "唐诗三百首",
    category: "poetry",
    author: "清·蘅塘退士 编",
    description: "精选唐代名诗，五七言古今体皆备，临摹之余亦可诵读品味。",
    file: "/resources/唐诗三百首.txt",
  },
  {
    id: "shang-han-lun",
    title: "伤寒论",
    category: "medicine",
    author: "汉·张仲景",
    description: "辨证论治之祖，三百九十七法，方证相应，习医者必读经典。",
    file: "/resources/伤寒论.txt",
  },
  {
    id: "huang-di-nei-jing",
    title: "黄帝内经·素问",
    category: "medicine",
    author: "战国·佚名",
    description: "医家之宗，阴阳五行、藏象经络、病机诊法皆源于此。",
    file: "/resources/黄帝内经.txt",
  },
  {
    id: "zhen-jiu-da-cheng",
    title: "针灸大成（歌赋选）",
    category: "medicine",
    author: "明·杨继洲",
    description: "针灸歌赋集粹，标幽、百症、玉龙、天星十二穴等，便于临证取穴。",
    file: "/resources/针灸大成.txt",
  },
];

export const CATEGORY_LABELS: Record<TextResource["category"], string> = {
  primer: "蒙学经典",
  poetry: "诗词选粹",
  medicine: "中医典籍",
};

/** 加载资源原始文本 */
export async function loadResourceText(file: string): Promise<string> {
  const res = await fetch(file);
  if (!res.ok) {
    throw new Error(`资源加载失败: ${file}`);
  }
  return res.text();
}
