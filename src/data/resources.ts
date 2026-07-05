import type { TextResource } from "@/types";

/** 内置资源索引 —— 资源文件位于 public/resources/ */
export const RESOURCES: TextResource[] = [
  {
    id: "san-zi-jing",
    title: "三字经",
    category: "primer",
    author: "宋·王应麟",
    description: "蒙学之首，三字一句，朗朗上口，涵盖常识、伦理、历史、勤学。",
    file: "/resources/san-zi-jing.txt",
  },
  {
    id: "bai-jia-xing",
    title: "百家姓",
    category: "primer",
    author: "宋·佚名",
    description: "收录中国常见姓氏，四字一句，韵律齐整，便于记诵。",
    file: "/resources/bai-jia-xing.txt",
  },
  {
    id: "qian-zi-wen",
    title: "千字文",
    category: "primer",
    author: "梁·周兴嗣",
    description: "一千字不重，涵盖天文地理、修身治国，历代书家最爱临写之本。",
    file: "/resources/qian-zi-wen.txt",
  },
  {
    id: "tang-shi",
    title: "唐诗三百首",
    category: "poetry",
    author: "清·蘅塘退士 编",
    description: "精选唐代名诗，五七言古今体皆备，临摹之余亦可诵读品味。",
    file: "/resources/tang-shi.txt",
  },
  {
    id: "shang-han-lun",
    title: "伤寒论",
    category: "medicine",
    author: "汉·张仲景",
    description: "辨证论治之祖，三百九十七法，方证相应，习医者必读经典。",
    file: "/resources/shang-han-lun.txt",
  },
  {
    id: "huang-di-nei-jing",
    title: "黄帝内经·素问",
    category: "medicine",
    author: "战国·佚名",
    description: "医家之宗，阴阳五行、藏象经络、病机诊法皆源于此。",
    file: "/resources/huang-di-nei-jing.txt",
  },
  {
    id: "zhen-jiu-da-cheng",
    title: "针灸大成（歌赋选）",
    category: "medicine",
    author: "明·杨继洲",
    description: "针灸歌赋集粹，标幽、百症、玉龙、天星十二穴等，便于临证取穴。",
    file: "/resources/zhen-jiu-da-cheng.txt",
  },
  {
    id: "yi-jing",
    title: "周易（经文）",
    category: "classics",
    author: "周·佚名",
    description: "群经之首，六十四卦卦辞与爻辞，阴阳变化之大道，临写可静心明理。",
    file: "/resources/yi-jing.txt",
  },
  {
    id: "liu-shi-si-gua",
    title: "六十四卦名目",
    category: "classics",
    author: "周·佚名",
    description: "上下经卦序备查，乾坤屯蒙需讼师，比小畜兮履泰否，一气贯通。",
    file: "/resources/liu-shi-si-gua.txt",
  },
  {
    id: "jiu-zhang-suan-shu",
    title: "九章算术（选）",
    category: "mathematics",
    author: "汉·张苍 等整理",
    description: "算经之首，方田、粟米、衰分、少广、商功、均输、盈不足、方程、勾股九章。",
    file: "/resources/jiu-zhang-suan-shu.txt",
  },
  {
    id: "zhou-bi-suan-jing",
    title: "周髀算经",
    category: "mathematics",
    author: "汉·佚名",
    description: "最古天算之书，周公商高问答，勾三股四弦五，盖天之说所自出。",
    file: "/resources/zhou-bi-suan-jing.txt",
  },
  {
    id: "shi-ji-tian-guan-shu",
    title: "史记·天官书",
    category: "astronomy",
    author: "汉·司马迁",
    description: "中国最早的星象专篇，中宫太一、二十八宿、五星凌犯，天人感应之枢。",
    file: "/resources/shi-ji-tian-guan-shu.txt",
  },
  {
    id: "kai-yuan-zhan-jing",
    title: "开元占经（选）",
    category: "astronomy",
    author: "唐·瞿昙悉达",
    description: "唐代集大成之星占书，日月五星、二十八宿、流星客星妖星杂占备录。",
    file: "/resources/kai-yuan-zhan-jing.txt",
  },
  {
    id: "zhou-yi-can-tong-qi",
    title: "周易参同契",
    category: "daoist",
    author: "汉·魏伯阳",
    description: "万古丹经王，借周易爻象以言炉火，参同大易、黄老、炉火三家为一。",
    file: "/resources/zhou-yi-can-tong-qi.txt",
  },
  {
    id: "bao-pu-zi-nei-pian",
    title: "抱朴子内篇（选）",
    category: "daoist",
    author: "晋·葛洪",
    description: "丹鼎派要籍，畅玄论仙、金丹黄白、遐览祛惑，魏晋神仙学说之总汇。",
    file: "/resources/bao-pu-zi-nei-pian.txt",
  },
];

export const CATEGORY_LABELS: Record<TextResource["category"], string> = {
  primer: "蒙学经典",
  poetry: "诗词选粹",
  medicine: "中医典籍",
  classics: "经部要籍",
  mathematics: "算学典籍",
  astronomy: "天文星占",
  daoist: "道家丹经",
};

/** 加载资源原始文本 */
export async function loadResourceText(file: string): Promise<string> {
  const res = await fetch(file);
  if (!res.ok) {
    throw new Error(`资源加载失败: ${file}`);
  }
  return res.text();
}
