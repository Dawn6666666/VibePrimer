import type { ThemeCollections } from 'vuepress-theme-plume'
import { defineCollection, defineCollections } from 'vuepress-theme-plume'

const start = defineCollection({
  type: 'doc',
  dir: 'start',
  title: '准备',
  linkPrefix: '/start/',
  sidebar: [
    {
      text: '第 0 章 · 开工之前',
      icon: 'carbon:play-filled',
      items: ['what', 'vscode', 'agent', 'git', 'ready'],
    },
  ],
})

const loop = defineCollection({
  type: 'doc',
  dir: 'loop',
  title: '五步循环',
  linkPrefix: '/loop/',
  sidebar: [
    {
      text: '第 1 章 · 五步循环',
      icon: 'carbon:repeat',
      items: ['index', 'think', 'plan', 'build', 'fix', 'ship'],
    },
  ],
})

const caseTimer = defineCollection({
  type: 'doc',
  dir: 'case-timer',
  title: '案例一',
  linkPrefix: '/case-timer/',
  sidebar: [
    {
      text: '第 2 章 · 案例一：番茄钟',
      icon: 'carbon:timer',
      items: ['index', 'requirement', 'prompt', 'run', 'bug', 'finish'],
    },
  ],
})

const caseSchedule = defineCollection({
  type: 'doc',
  dir: 'case-schedule',
  title: '案例二',
  linkPrefix: '/case-schedule/',
  sidebar: [
    {
      text: '第 3 章 · 案例二：课程表',
      icon: 'carbon:calendar-heat-map',
      items: ['index', 'requirement', 'plan', 'build', 'debug', 'ship'],
    },
  ],
})

const craft = defineCollection({
  type: 'doc',
  dir: 'craft',
  title: '手艺库',
  linkPrefix: '/craft/',
  sidebar: [
    {
      text: '第 4 章 · 手艺库',
      icon: 'carbon:tool-box',
      items: ['prompt', 'context', 'read', 'test', 'safety'],
    },
  ],
})

const appendix = defineCollection({
  type: 'doc',
  dir: 'appendix',
  title: '附录',
  linkPrefix: '/appendix/',
  sidebar: [
    {
      text: '模板库',
      icon: 'carbon:document',
      items: ['templates', 'glossary'],
    },
  ],
})

const pitfalls = defineCollection({
  type: 'doc',
  dir: 'pitfalls',
  title: '坑',
  linkPrefix: '/pitfalls/',
  sidebar: [
    {
      text: '第 5 章 · 二十个坑',
      icon: 'carbon:warning-alt',
      items: ['index'],
    },
  ],
})

const after = defineCollection({
  type: 'doc',
  dir: 'after',
  title: '之后',
  linkPrefix: '/after/',
  sidebar: [
    {
      text: '之后',
      icon: 'carbon:arrow-up-right',
      items: ['next', 'reading'],
    },
  ],
})

export const collections: ThemeCollections = defineCollections([
  start,
  loop,
  caseTimer,
  caseSchedule,
  craft,
  pitfalls,
  after,
  appendix,
])
