import type { ThemeConfig } from 'vuepress-theme-plume'
import { defineThemeConfig } from 'vuepress-theme-plume'
import { collections } from './collections/index.js'
import { navbar } from './navbar.js'

export default defineThemeConfig({
  logo: '/logo.svg',

  navbar,

  collections,

  // 文档站不需要个人主页区域
  profile: false,

  footer: {
    copyright: '写给大一下的 Vibe Coding 入门指南 · 用 vuepress-theme-plume 搭的',
  },

  editLink: false,
  contributors: false,
  changelog: false,

  prevPage: true,
  nextPage: true,
})
