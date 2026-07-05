# 汉字字帖生成器

一个可生成、预览、打印的汉字临摹字帖工具，内置经典文本资源库，支持多种排版样式与描红模式，样式可持续扩展。

## 功能特性

### 核心能力
- **字帖生成**：根据选择的文本与样式生成可临摹的字帖
- **打印输出**：连接打印机直接打印，支持打印预览
- **预览效果**：生成前实时预览版式与样式
- **资源库**：内置 15 部经典，覆盖蒙学、诗词、经部、中医、算学、天文、道家七大门类，可扩展
  - 蒙学：三字经、百家姓、千字文
  - 诗词：唐诗三百首
  - 经部：周易经文、六十四卦名目
  - 中医：伤寒论、黄帝内经·素问、针灸大成
  - 算学：九章算术、周髀算经
  - 天文：史记·天官书、开元占经
  - 道家：周易参同契、抱朴子内篇

### 排版样式
- **横排左到右**：现代常规横排
- **竖排右到左**：传统竖排，从右向左阅读
- 样式可扩展（后续支持更多版式）

### 字格样式
- **田字格**：标准米字格/田字格底纹
- **描红**：浅色（红色）字模供描摹
- **字体轮廓**：仅显示字形轮廓供临摹
- **多种样式**：支持多种字格与字模组合，后期可扩展

### 字符集与笔画
- **字符集模式**：自动 / 简体 / 繁体 / 简繁对照
- **笔画展开**：按笔画顺序逐笔临摹，内置简繁字典与笔画数据
- **AI 配图**：支持为字帖添加 AI 生成的插图，可选墨、工笔、白描、木刻风格

### 扩展性
- 样式与版式采用插件化/配置化设计，便于后期新增
- 文本资源库可动态加载与扩充，自定义文本可粘贴即用

## 技术栈

| 模块 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | React 18 + TypeScript | 组件化 UI |
| 构建 | Vite 6 | 极速 HMR 与打包 |
| 状态 | Zustand | 轻量全局状态 |
| 路由 | React Router 7 | 页面切换 |
| 样式 | TailwindCSS 3 | 原子化样式 |
| 渲染 | SVG | 矢量绘制，打印精度可控 |
| 字模 | 矢量字体 + 轮廓/笔画数据 | 支持描红、轮廓、笔画展开 |
| 打印 | 浏览器原生打印 | 经多轮打印机驱动兼容性修复 |
| 部署 | Vercel | 静态站点托管 |

## 目录结构

```
hanzi/
├── public/
│   ├── resources/          # 内置经典文本（UTF-8 纯文本）
│   │   ├── san-zi-jing.txt
│   │   ├── bai-jia-xing.txt
│   │   ├── qian-zi-wen.txt
│   │   ├── tang-shi.txt
│   │   ├── yi-jing.txt
│   │   ├── liu-shi-si-gua.txt
│   │   ├── shang-han-lun.txt
│   │   ├── huang-di-nei-jing.txt
│   │   ├── zhen-jiu-da-cheng.txt
│   │   ├── jiu-zhang-suan-shu.txt
│   │   ├── zhou-bi-suan-jing.txt
│   │   ├── shi-ji-tian-guan-shu.txt
│   │   ├── kai-yuan-zhan-jing.txt
│   │   ├── zhou-yi-can-tong-qi.txt
│   │   └── bao-pu-zi-nei-pian.txt
│   └── favicon.svg
├── src/
│   ├── components/         # 组件
│   │   ├── AiIllustration/ # AI 插图对话框
│   │   ├── Copybook/       # 字帖页面与字格样式
│   │   └── Workbench/      # 工作台：预览/资源/设置/工具栏
│   ├── data/
│   │   └── resources.ts    # 资源索引与分类
│   ├── generator/          # 字帖生成核心
│   │   ├── paginator.ts    # 分页器
│   │   └── textProcessor.ts# 文本处理
│   ├── store/
│   │   └── useCopybookStore.ts # Zustand 状态
│   ├── utils/
│   │   ├── convert.ts      # 简繁转换
│   │   ├── dict/           # 简繁字典
│   │   └── strokeData.ts   # 笔画数据
│   ├── pages/
│   │   └── Home.tsx        # 首页
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts            # 核心类型定义
├── .trae/
│   └── documents/          # PRD 与技术文档
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run check

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 资源库说明

内置资源存放于 [public/resources/](public/resources/)，为 UTF-8 编码的纯文本文件。资源索引、分类与加载逻辑见 [src/data/resources.ts](src/data/resources.ts)。

新增资源只需两步：
1. 将 `.txt` 文件放入 `public/resources/`
2. 在 `RESOURCES` 数组中追加一条记录，指定 `id` / `title` / `category` / `author` / `description` / `file`

如需新增分类，在 [src/types.ts](src/types.ts) 的 `ResourceCategory` 与 [src/data/resources.ts](src/data/resources.ts) 的 `CATEGORY_LABELS` 中同步添加，并更新 [src/components/Workbench/ResourcePanel.tsx](src/components/Workbench/ResourcePanel.tsx) 的 `CATEGORY_ORDER`。
