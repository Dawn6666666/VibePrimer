---
pageLayout: home
config:
  - type: hero
    full: true
    hero:
      name: Vibe Coding 入门
      tagline: 从一句话，到能交付的作品
      text: >-
        写给大一下的你。先把 VS Code 和一个编程 Agent 装好，
        再用两个案例走通「想清楚 → 定计划 → 生成并运行 → 发现问题并修改 → 检查并交付」。
      actions:
        - theme: brand
          text: 从第 0 章开始
          link: /start/what/
          icon: carbon:play-filled
        - theme: alt
          text: 先看五步循环
          link: /loop/
          suffixIcon: carbon:arrow-right
    effect: tint-plate
  - type: features
    features:
      - title: 环境不是背景板
        icon: carbon:settings-check
        details: VS Code、Agent、Git、运行时，一样一样装，最后有一张验收表。装不上的地方写清楚了，照着做就行。
        link: /start/what/
      - title: 五步循环
        icon: carbon:repeat
        details: 想清楚、定计划、生成并运行、发现问题并修改、检查并交付。每一步都有产出物和验收标准，不是口号。
        link: /loop/
      - title: 两个案例，一大一小
        icon: carbon:code
        details: 番茄钟（单文件，两小时）和课程表（多文件，一个周末）。从「能跑」走到「能交」。
        link: /case-timer/
      - title: 需求分析是主线
        icon: carbon:document-word-processor
        details: 需求卡、验收清单、不做什么清单。这份指南里，生成代码只是中间产物。
        link: /craft/prompt/
      - title: 二十个坑
        icon: carbon:warning-alt
        details: 报错直接复制粘贴、一口气让 AI 写八百行、看不懂就不敢改……每条都配了解法。
        link: /pitfalls/
      - title: 能复制走的东西
        icon: carbon:copy-file
        details: 需求卡、验收清单、交接说明、十二个提示词模板。全部可以原样拿去用。
        link: /appendix/templates/
  - type: HomeRead
title: 首页
---

<style>
.vp-home-hero .hero-tagline {
  max-width: 18em;
  margin-inline: auto;
}
.vp-home-hero .hero-text {
  margin-top: 28px;
  max-width: 34em;
  margin-inline: auto;
  line-height: 1.9;
}
</style>
