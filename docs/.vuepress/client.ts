import { defineClientConfig } from 'vuepress/client'

import './styles/index.css'

import FiveLoop from './components/FiveLoop.vue'
import Gate from './components/Gate.vue'
import HomeRead from './components/HomeRead.vue'
import PromptBuilder from './components/PromptBuilder.vue'
import Quiz from './components/Quiz.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('FiveLoop', FiveLoop)
    app.component('Gate', Gate)
    app.component('HomeRead', HomeRead)
    app.component('PromptBuilder', PromptBuilder)
    app.component('Quiz', Quiz)
  },
})
