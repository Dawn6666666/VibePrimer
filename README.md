# Vibe Coding 入门

写给大一下学期、刚接触 Vibe Coding 的同学的交互式入门指南。

主线是需求分析：先确定要什么和怎样算完成，再让 AI 分步生成代码，最后独立验证、修改和交付。

## 内容

| 章节 | 内容 |
| --- | --- |
| 第 0 章 · 准备 | VS Code、Git、编程 Agent 与环境验收 |
| 第 1 章 · 五步循环 | 想清楚、定计划、生成并运行、调试、检查并交付 |
| 第 2 章 · 番茄钟 | 单文件、状态、时间戳与 localStorage，从需求走到交付 |
| 第 3 章 · 课程表 | 多文件、二维表、单双周、冲突检测和数据校验 |
| 第 4 章 · 手艺库 | 提示词、上下文、读代码、测试与安全 |
| 第 5 章 · 二十个坑 | 按项目顺序整理症状、原因和处理方法 |
| 附录 | 12 份开发模板与术语表 |
| 延伸 | 后续实践路线与原文阅读链接 |

番茄钟页面包含完成版和用于观察问题的错误版，课程表页面包含完成版，均可直接在页内操作。文章会指导读者在自己的项目中复现、修改和验收。

## 本地运行

需要仍受支持的 Node.js 和 pnpm。`package.json` 的 `packageManager` 字段指定了本项目使用的 pnpm 版本，可通过 Corepack 或已有的版本管理工具准备对应环境。

```bash
pnpm install
pnpm dev          # http://localhost:4500
pnpm build        # 产物在 docs/.vuepress/dist
```

## 技术栈

- VuePress `2.0.0-rc.31`
- vuepress-theme-plume `1.0.0-rc.214`
- vuepress-plugin-md-power `1.0.0-rc.214`，提供 `::: chat`、`::: field`、`::: timeline`、`::: demo` 等容器

## 交互组件

`docs/.vuepress/components/` 下有五组组件：

- `FiveLoop.vue`：五步循环点选器
- `Gate.vue` 与 `gate-data.ts`：验收清单，勾选状态保存在 localStorage
- `Quiz.vue`：单选小测与解释
- `PromptBuilder.vue`：六格提示词生成器，可复制
- `HomeRead.vue`：首页阅读指南

这个主题版本不会自动注册 `components/` 下的组件，需要在 `docs/.vuepress/client.ts` 中手动调用 `app.component(...)`，否则组件不会显示，也未必给出明显报错。

## 目录

```text
docs/
├── README.md              首页
├── start/                 第 0 章 · 准备
├── loop/                  第 1 章 · 五步循环
├── case-timer/            第 2 章 · 番茄钟
├── case-schedule/         第 3 章 · 课程表
├── craft/                 第 4 章 · 手艺库
├── pitfalls/              第 5 章 · 二十个坑
├── appendix/              模板库、术语表
├── after/                 后续实践、延伸阅读
└── .vuepress/             配置、导航、组件、样式
```

教学用途，转载注明出处。
