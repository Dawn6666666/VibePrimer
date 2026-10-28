import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Vibe Coding 入门',
  description:
    '写给大一下的 Vibe Coding 交互入门指南：先准备 VS Code 和一个编程 Agent，再用两个案例走通「想清楚 → 定计划 → 生成并运行 → 发现问题并修改 → 检查并交付」。',

  head: [
    ['meta', { name: 'theme-color', content: '#4c6ef5' }],
    ['meta', { name: 'author', content: 'YG' }],
  ],

  bundler: viteBundler(),

  theme: plumeTheme({
    hostname: 'https://vibe-primer.pages.dev',

    search: { provider: 'local' },

    codeHighlighter: {
      lineNumbers: 12,
      twoslash: false,
    },

    markdown: {
      fileTree: true,
      codeTabs: { icon: true },
      chat: true,
      timeline: true,
      collapse: true,
      field: true,
      table: true,
      codeTree: true,
      npmTo: ['pnpm', 'npm'],
      demo: true,
      mermaid: true,
      mark: 'lazy',
      icon: { provider: 'iconify' },
      math: false,
    },

    // 首页与目录页的视觉，稍后在 styles/index.css 里收紧
    transition: { appearance: 'fade' },
  }),
})
