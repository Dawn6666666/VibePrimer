import type { ThemeNavItem } from 'vuepress-theme-plume'
import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar: ThemeNavItem[] = defineNavbarConfig([
  {
    text: '准备',
    icon: 'carbon:settings-check',
    link: '/start/what/',
    activeMatch: '^/start/',
  },
  {
    text: '五步循环',
    icon: 'carbon:repeat',
    link: '/loop/',
    activeMatch: '^/loop/',
  },
  {
    text: '案例',
    icon: 'carbon:code',
    items: [
      { text: '案例一 · 番茄钟', link: '/case-timer/', icon: 'carbon:timer' },
      { text: '案例二 · 课程表', link: '/case-schedule/', icon: 'carbon:calendar-heat-map' },
    ],
  },
  {
    text: '核心技能',
    icon: 'carbon:tool-box',
    link: '/craft/prompt/',
    activeMatch: '^/craft/',
  },
  {
    text: '坑',
    icon: 'carbon:warning-alt',
    link: '/pitfalls/',
    activeMatch: '^/pitfalls/',
  },
  {
    text: '附录',
    icon: 'carbon:book',
    items: [
      { text: '模板库', link: '/appendix/templates/', icon: 'carbon:document' },
      { text: '术语表', link: '/appendix/glossary/', icon: 'carbon:character-whole-number' },
      { text: '下一步', link: '/after/next/', icon: 'carbon:arrow-up-right' },
      { text: '读的东西', link: '/after/reading/', icon: 'carbon:bookmark' },
    ],
  },
])
