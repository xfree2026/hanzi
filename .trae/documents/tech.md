# 汉字字帖生成器 — 技术架构文档

## 1. 架构设计

纯前端单页应用，无后端服务。文本资源以静态 JSON 形式打包，AI 配图通过浏览器直接调用图像生成 API。

```mermaid
flowchart TD
    subgraph "前端层"
        "UI 组件 React" --> "状态管理 Zustand"
        "状态管理 Zustand" --> "字帖生成核心"
        "字帖生成核心" --> "SVG 渲染器"
        "SVG 渲染器" --> "打印适配器"
        "打印适配器" --> "浏览器打印"
    end
    subgraph "数据层"
        "静态文本资源 JSON" --> "资源加载器"
    end
    subgraph "外部服务"
        "AI 配图" --> "图像生成 API"
    end
    "资源加载器 --> 字帖生成核心"
    "图像生成 API --> SVG 渲染器"
```

## 2. 技术说明

- **前端**：React 18 + TypeScript + Vite
- **样式**：Tailwind CSS 3 + CSS 变量（主题色）
- **状态管理**：Zustand
- **路由**：单页应用，无需 React Router（一个工作台页面 + 弹窗）
- **图标**：lucide-react
- **字体**：Google Fonts（Noto Serif SC / Noto Sans SC / Ma Shan Zheng）+ 系统楷体
- **渲染**：原生 SVG，矢量精确控制打印
- **打印**：`window.print()` + `@media print` 样式隔离
- **AI 配图**：默认 `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image`，可在配置中替换
- **初始化工具**：vite-init（react-ts 模板）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 字帖工作台（含资源库、预览、设置、AI 配图、打印） |

## 4. 模块结构

```
src/
├── components/
│   ├── Workbench/         # 字帖工作台
│   │   ├── Toolbar.tsx          # 顶部工具栏
│   │   ├── ResourcePanel.tsx    # 左侧资源库
│   │   ├── PreviewCanvas.tsx    # 中央预览画布
│   │   ├── SettingsPanel.tsx    # 右侧设置面板
│   │   └── ResourceModal.tsx    # 资源原文弹窗
│   ├── Copybook/
│   │   ├── CopybookPage.tsx     # 单页 SVG 字帖
│   │   ├── Cell.tsx             # 单字格
│   │   └── gridStyles.ts        # 字格样式定义（插件化）
│   └── AiIllustration/
│       └── AiIllustrationDialog.tsx  # AI 配图弹窗
├── generator/
│   ├── layout.ts          # 版式（横排/竖排）布局算法
│   ├── paginator.ts       # 分页算法
│   └── textProcessor.ts   # 文本清洗、汉字过滤
├── store/
│   └── useCopybookStore.ts  # Zustand 全局状态
├── data/
│   └── resources.ts       # 内置资源索引（动态 import 资源 JSON）
├── styles/
│   └── theme.css          # 主题色变量、宣纸纹理
└── App.tsx
```

## 5. 字格样式扩展机制

每种字格样式实现统一接口：

```typescript
interface GridStyle {
  id: string;            // 'tian' | 'mi' | 'jiugong' | 'miaohong' | 'lunkuo' | 'shixin'
  name: string;          // 显示名称
  renderBackground: (size: number) => JSX.Element;  // 字格底纹
  renderChar: (char: string, size: number, font: string) => JSX.Element;  // 字模
}
```

新增样式只需在 `gridStyles.ts` 中追加实现并注册到列表，无需改动其他模块。

## 6. AI 配图接口

请求：`GET https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={prompt}&image_size={image_size}`

返回图片二进制流，浏览器直接 `<img>` 渲染。配置项：

```typescript
interface AiImageConfig {
  endpoint: string;     // 默认 trae-api-cn
  defaultStyle: 'ink' | 'gongbi' | 'line' | 'woodblock';
  imageSize: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9';
}
```

提示词模板：`{stylePrompt} + 主题：{userPrompt}，水墨晕染，留白构图，无文字`

## 7. 数据模型

### 7.1 资源数据结构

```typescript
interface TextResource {
  id: string;            // 'san-zi-jing'
  title: string;         // '三字经'
  category: 'primer' | 'poetry' | 'medicine';  // 蒙学/诗词/中医
  author?: string;
  description: string;
  content: string;       // 完整原文
  charCount: number;
}
```

### 7.2 字帖配置数据结构

```typescript
interface CopybookConfig {
  resourceId: string | null;
  customText: string;
  gridStyle: string;            // GridStyle.id
  layout: 'horizontal-lr' | 'vertical-rl';
  charsPerRow: number;
  rowsPerPage: number;
  cellSize: number;             // px
  font: string;                 // 'KaiTi' | 'STKaiti' | 'Noto Serif SC' ...
  showPinyin: boolean;
  illustration: {
    url: string | null;
    position: 'header' | 'footer' | 'title-page' | null;
  };
}
```

## 8. 打印适配

- A4 纸张：210mm × 297mm
- `@media print` 隐藏工具栏与设置面板，仅显示 SVG 字帖页
- 每页 `.copybook-page` 强制 `page-break-after: always`
- 字格使用 SVG 矢量元素，保证打印精度
