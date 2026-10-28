---
title: 值得读的
icon: carbon:bookmark
permalink: /after/reading/
createTime: 2026/10/28 10:56:00
---

下面优先给原始文章、官方文档和论文。可以按当前问题选读，不必一次看完。链接核对时间为 2026 年 10 月，产品文档之后仍可能更新。

## 概念从哪里来

**[Andrej Karpathy：vibe coding 原始帖子](https://x.com/karpathy/status/1886192184808149383)**（2025 年 2 月）

阅读时关注他最初描述的使用方式，以及这种低风险试验和可交付软件之间的差别。不必把一条帖子当成完整开发流程。

**[Simon Willison：Vibe engineering](https://simonwillison.net/2025/Oct/7/vibe-engineering/)**（2025 年 10 月 7 日）

文章讨论专业开发者使用 LLM 时如何继续承担质量责任。相关术语后来仍在演变，重点看审查、测试、文档和责任划分，不必背名词。

## 工具与工作方法

**[Claude Code Docs：Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)**

当前文档强调提供 Agent 无法自行知道的信息、给它可运行的检查，以及对绝不能违反的规则使用确定性限制。`CLAUDE.md` 适合保存简短项目背景，测试和权限则提供不同强度的约束。

文档也建议在两次纠正仍无效后清理会话、改写提示词。这是特定工具的工作建议，不是所有 Agent 都必须遵守的次数规则。本指南把访谈、需求文件、验证和权限管理整理成通用做法，不把这些做法都归为官方固定四步。

**[GitHub Spec Kit](https://github.com/github/spec-kit)** 与 **[Spec Kit 文档](https://github.github.com/spec-kit/)**

可以查看规格、计划和任务怎样串起来。工具模板不是唯一答案，阅读时对照本指南的 `REQUIREMENT.md`、`TODO.md` 和验收标准即可。

## 长上下文研究

**[Chroma：Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://research.trychroma.com/context-rot)**（2025 年）

报告评估 18 个模型在多类任务上的输入长度变化，讨论模型表现并不随输入长度保持一致。阅读时应看具体任务和模型差异，不能把结果简化成所有场景都有一个固定下降点。

**[Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)**

这是另一项独立研究，重点分析关键信息位置对长上下文使用的影响。它能帮助理解信息组织问题，但不能替代你在自己的模型和任务上做验证。

## 依赖幻觉研究

**[We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs](https://arxiv.org/abs/2406.10279)**

论文分析 16 个模型在两个提示数据集、两种编程语言下生成的 57.6 万个代码样本。摘要报告商业模型和开源模型的平均幻觉包比例分别至少为 5.2% 和 21.7%。这些数字属于论文的实验设置，不是所有现实项目或当前模型的固定发生率。

安装依赖前，先核对官方文档、包名、版本、发布者和仓库。404 可能来自拼写、版本或 registry；下载量低不代表包不存在，下载量高也不能证明安全。是否存在和是否值得信任要分别判断。

## 中文教程和录屏怎么选

优先选择能查看完整项目、实际报错和修改过程的材料。录屏最好保留定位问题的过程，而不只展示最后一次成功运行。看到“十分钟精通”“万能提示词”时，先检查它是否提供项目背景、适用条件和验收结果。

工具评测可以用来发现功能，但价格、额度和界面应以当前官方页面为准。

## 带着问题读

一次选一篇，先写一个与当前项目有关的问题。例如：“这个案例怎样保存进度？”“它怎样确认代码真的运行过？”读完后记录一条能用于当前项目的做法，并注明适用条件。

自己的 `BUGS.md` 也值得定期重读。它记录的是你真实遇到的环境、假设和复测结果，比通用错误清单更贴近当前项目。格式见 [模板库](/appendix/templates/)。
