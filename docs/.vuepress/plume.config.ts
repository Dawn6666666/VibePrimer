import type { ThemeConfig } from 'vuepress-theme-plume'
import { defineThemeConfig } from 'vuepress-theme-plume'
import { collections } from './collections/index.js'
import { navbar } from './navbar.js'

export default defineThemeConfig({
  logo: '/logo.svg',

  navbar,

  collections,

  // 文档站不需要个人主页区域与额外底栏
  profile: false,
  footer: false,

  editLink: false,
  contributors: false,
  changelog: false,

  prevPage: true,
  nextPage: true,
})
