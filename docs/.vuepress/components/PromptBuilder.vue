<script setup lang="ts">
import { computed, ref } from 'vue'

interface Fields {
  role: string
  task: string
  context: string
  constraints: string
  acceptance: string
  dont: string
}

const empty: Fields = {
  role: '',
  task: '',
  context: '',
  constraints: '',
  acceptance: '',
  dont: '',
}

const fields = ref<Fields>({ ...empty })
const copied = ref(false)

const presets: Record<string, Fields> = {
  番茄钟: {
    role: '一个有耐心的前端工程师，习惯用最小的实现解决问题',
    task: '做一个番茄钟网页，25 分钟倒计时，有开始/暂停和重置两个按钮',
    context:
      '项目里只有 index.html 一个文件，纯原生 HTML/CSS/JS，不装任何依赖。用 Date.now() 算剩余时间，不要用累加。',
    constraints:
      '单文件、双击就能打开；数据存 localStorage；只做桌面布局，手机能居中不溢出即可。',
    acceptance:
      '1. 打开显示 25:00，每秒减 1\n2. 点暂停停住，再点继续接着走\n3. 归零显示 00:00 并改标题\n4. 连点五次开始，速度不变',
    dont: '不做登录、自定义时长、休息倒计时、声音、统计图表；不要引入任何框架。',
  },
  课程表: {
    role: '一个前端工程师，重视数据结构和可维护性',
    task: '做一个周课程表页面，能切换查看第 1 周到第 16 周',
    context:
      '课程数据写在一个单独的 data.js 里，每条包含：名称、星期、开始节次、持续节数、单双周、地点。页面用 CSS Grid 渲染 7 列×12 节。',
    constraints:
      '原生 JS，不用框架；数据与渲染分离；手机宽度下表格可横向滚动。',
    acceptance:
      '1. 加一门课只改 data.js\n2. 单双周的课显示正确\n3. 连上四节的课合并成一个格子\n4. 手机宽度不撑破页面',
    dont: '不做登录、不做后端、不做导入导出；不要用 React/Vue。',
  },
}

const output = computed(() => {
  const f = fields.value
  const parts: string[] = []
  if (f.role) parts.push(`你是${f.role}。`)
  if (f.task) parts.push(`\n任务：${f.task}`)
  if (f.context) parts.push(`\n上下文：${f.context}`)
  if (f.constraints) parts.push(`\n约束：${f.constraints}`)
  if (f.acceptance.trim()) {
    parts.push(`\n验收标准：\n${f.acceptance.trim()}`)
  }
  if (f.dont) parts.push(`\n不要做：${f.dont}`)
  parts.push(
    '\n先不要写代码。把你不确定的地方列成问题问我，最多 10 个。我确认之后你再动手。',
  )
  return parts.join('\n').trim()
})

const isEmpty = computed(() => !fields.value.task && !fields.value.context)

function usePreset(name: string) {
  const p = presets[name]
  if (p) fields.value = { ...p }
}

function clear() {
  fields.value = { ...empty }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="pb">
    <div class="pb-top">
      <span class="pb-tag">六格提示词</span>
      <div class="pb-presets">
        <button v-for="name in Object.keys(presets)" :key="name" class="pb-chip" @click="usePreset(name)">
          填 {{ name }}
        </button>
        <button class="pb-chip ghost" @click="clear">清空</button>
      </div>
    </div>

    <div class="pb-grid">
      <label class="pb-field">
        <span>角色 · 它是谁</span>
        <input v-model="fields.role" placeholder="一个有耐心的前端工程师" >
      </label>
      <label class="pb-field">
        <span>任务 · 做什么</span>
        <input v-model="fields.task" placeholder="做一个 25 分钟倒计时" >
      </label>
      <label class="pb-field">
        <span>上下文 · 它看不到的信息</span>
        <textarea v-model="fields.context" rows="3" placeholder="单文件、原生 JS、数据在 data.js 里……" />
      </label>
      <label class="pb-field">
        <span>约束 · 硬条件</span>
        <textarea v-model="fields.constraints" rows="3" placeholder="不装依赖、不改现有类名、只改一个文件……" />
      </label>
      <label class="pb-field">
        <span>验收 · 怎么算做完</span>
        <textarea v-model="fields.acceptance" rows="4" placeholder="1. 点开始每秒减 1&#10;2. 刷新后数据不丢" />
      </label>
      <label class="pb-field">
        <span>不要做 · 排除项</span>
        <textarea v-model="fields.dont" rows="4" placeholder="不做登录、不做多语言、不要顺手重构……" />
      </label>
    </div>

    <div class="pb-out">
      <div class="pb-out-head">
        <span>生成结果</span>
        <button class="pb-copy" :disabled="isEmpty" @click="copy">
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      <pre v-if="!isEmpty">{{ output }}</pre>
      <p v-else class="pb-empty">先填「任务」和「上下文」，右边会实时生成。</p>
    </div>
  </div>
</template>

<style scoped>
.pb {
  margin: 22px 0;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  border-radius: 12px;
  padding: 16px;
}

.pb-top {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.pb-tag {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-2, #888);
  text-transform: uppercase;
}

.pb-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pb-chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-brand-1, #4c6ef5);
  background: color-mix(in srgb, var(--vp-c-brand-1, #4c6ef5) 8%, transparent);
  color: var(--vp-c-brand-1, #4c6ef5);
  cursor: pointer;
}

.pb-chip.ghost {
  border-color: var(--vp-c-divider, rgba(128, 128, 128, 0.3));
  background: transparent;
  color: var(--vp-c-text-2, #888);
}

.pb-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

@media (min-width: 680px) {
  .pb-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.pb-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: var(--vp-c-text-2, #888);
}

.pb-field input,
.pb-field textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.6;
  font-family: inherit;
  color: var(--vp-c-text-1, inherit);
  background: var(--vp-c-bg-alt, rgba(128, 128, 128, 0.06));
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  border-radius: 8px;
  resize: vertical;
}

.pb-field input:focus,
.pb-field textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1, #4c6ef5);
}

.pb-out {
  margin-top: 16px;
  border-top: 1px dashed var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  padding-top: 12px;
}

.pb-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--vp-c-text-2, #888);
  margin-bottom: 8px;
}

.pb-copy {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 7px;
  border: 1px solid var(--vp-c-brand-1, #4c6ef5);
  background: var(--vp-c-brand-1, #4c6ef5);
  color: #fff;
  cursor: pointer;
}

.pb-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pb-out pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--vp-code-block-bg, rgba(128, 128, 128, 0.1));
  color: var(--vp-c-text-1, inherit);
}

.pb-empty {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-3, #999);
}
</style>
