# Vibe Coding 入门

写给大一下学期、刚接触 Vibe Coding 的同学的交互式入门指南。

主线只有一条：**需求分析。生成代码不算完成任务。**
先想清楚要什么，再定义什么算做完，然后让 AI 去写，最后验证、修改、交付。

## 里面有什么

| 章节 | 内容 |
| --- | --- |
| 第 0 章 · 准备 | VS Code、编程 Agent、Git —— 一小时装完，最后一页有 9 项勾选验收 |
| 第 1 章 · 五步循环 | 想清楚 → 定计划 → 生成并运行 → 发现问题并修改 → 检查并交付 |
| 案例一 · 番茄钟 | 单文件、状态、localStorage。从一句需求走到能交出去的作品 |
| 案例二 · 课程表 | 多文件、二维表、单双周、冲突检测。数据先于界面 |
| 第 4 章 · 手艺库 | 提示词、上下文、读代码、测试、安全 |
| 第 5 章 · 二十个坑 | 按"你踩到的顺序"排，每条三行：症状、为什么、怎么办 |
| 附录 | 12 个可复制模板、术语表、然后呢、值得读的 |

两个案例各带两个**能直接运行的 demo**：一个完成版，一个故意写坏的第一版 —— 学生对着坏的那版找 bug，再对照好的那版看差距。

## 本地运行

```bash
pnpm install
pnpm dev          # http://localhost:4500
pnpm build        # 产物在 docs/.vuepress/dist
```

## 技术栈

- VuePress `2.0.0-rc.31`
- vuepress-theme-plume `1.0.0-rc.214`
- vuepress-plugin-md-power —— 提供 `::: chat`、`::: field`、`::: timeline`、`::: demo` 等容器

## 交互组件

`docs/.vuepress/components/` 下五个组件：

- `FiveLoop.vue` —— 五步循环点选器
- `Gate.vue` + `gate-data.ts` —— 验收清单，勾选状态存 localStorage
- `Quiz.vue` —— 单选小测，答完给解释
- `PromptBuilder.vue` —— 六格提示词生成器，可复制
- `HomeRead.vue` —— 首页「怎么读」区块

注意：这个主题版本**不会**自动注册 `components/` 下的组件，必须手动在 `docs/.vuepress/client.ts` 里 `app.component(...)`，否则组件会静默消失、也不报错。

## 目录

```
docs/
├── README.md              首页
├── start/                 第 0 章 · 准备
├── loop/                  第 1 章 · 五步循环
├── case-timer/            案例一 · 番茄钟
├── case-schedule/         案例二 · 课程表
├── craft/                 第 4 章 · 手艺库
├── pitfalls/              第 5 章 · 二十个坑
├── appendix/              模板库、术语表
├── after/                 然后呢、值得读的
└── .vuepress/             配置、导航、组件、样式
```

教学用途，转载注明出处。
