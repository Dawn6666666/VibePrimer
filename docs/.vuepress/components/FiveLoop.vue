<script setup lang="ts">
import { computed, ref } from 'vue'

interface Step {
  key: string
  title: string
  doing: string
  output: string
  done: string
}

const steps: Step[] = [
  {
    key: 'think',
    title: '想清楚',
    doing: '把「我想要」翻译成「谁用、输入什么、输出什么、什么不做、什么算做完」。',
    output: '半页需求卡 + 3 条验收标准',
    done: '别人看完，能用自己的话复述你要做什么',
  },
  {
    key: 'plan',
    title: '定计划',
    doing: '让 Agent 先别写代码，交文件清单和任务顺序。然后你砍掉一半。',
    output: '3–7 条任务，落在 TODO.md 里',
    done: '每条任务都能在 15 分钟内验证',
  },
  {
    key: 'build',
    title: '生成并运行',
    doing: '一次一条任务。先看 diff，再跑起来，跑通就提交。',
    output: '能跑的版本 + 一条 git commit',
    done: '你亲眼在屏幕里看见了结果',
  },
  {
    key: 'fix',
    title: '发现问题并修改',
    doing: '复现、读报错、二分定位、一次验证一个假设。',
    output: '修好的版本 + 一句「为什么错」',
    done: '同样的操作不再出错，而且你知道原因',
  },
  {
    key: 'ship',
    title: '检查并交付',
    doing: '对着验收标准逐条试，补做边界测试，写 README。',
    output: 'README + 能发出去的交付包',
    done: '别人照着说明，能自己跑起来',
  },
]

const current = ref(0)
const step = computed(() => steps[current.value]!)

function go(i: number) {
  current.value = (i + steps.length) % steps.length
}
</script>

<template>
  <div class="five-loop">
    <div class="fl-track" role="tablist" aria-label="五步循环">
      <button
        v-for="(s, i) in steps"
        :key="s.key"
        class="fl-node"
        :class="{ active: i === current, passed: i < current }"
        role="tab"
        :aria-selected="i === current"
        :aria-label="`第 ${i + 1} 步：${s.title}`"
        @click="go(i)"
      >
        <span class="fl-index">{{ i + 1 }}</span>
        <span class="fl-title">{{ s.title }}</span>
      </button>
    </div>

    <div class="fl-panel">
      <p class="fl-doing">{{ step.doing }}</p>
      <div class="fl-meta">
        <div>
          <span class="fl-label">产出物</span>
          <span class="fl-value">{{ step.output }}</span>
        </div>
        <div>
          <span class="fl-label">走完的标志</span>
          <span class="fl-value">{{ step.done }}</span>
        </div>
      </div>
      <div class="fl-actions">
        <button class="fl-btn" @click="go(current - 1)">上一步</button>
        <span class="fl-count">{{ current + 1 }} / {{ steps.length }}</span>
        <button class="fl-btn primary" @click="go(current + 1)">
          {{ current === steps.length - 1 ? '再来一圈' : '下一步' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.five-loop {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  border-radius: 12px;
  padding: 18px;
}

.fl-track {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fl-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px 7px 8px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  background: transparent;
  color: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.fl-node:hover {
  border-color: var(--vp-c-brand-1, #4c6ef5);
}

.fl-index {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  background: var(--vp-c-default-soft, rgba(128, 128, 128, 0.12));
  color: var(--vp-c-text-2, inherit);
}

.fl-node.active {
  border-color: var(--vp-c-brand-1, #4c6ef5);
  background: color-mix(in srgb, var(--vp-c-brand-1, #4c6ef5) 10%, transparent);
}

.fl-node.active .fl-index {
  background: var(--vp-c-brand-1, #4c6ef5);
  color: #fff;
}

.fl-node.passed .fl-index {
  background: color-mix(in srgb, var(--vp-c-brand-1, #4c6ef5) 22%, transparent);
  color: var(--vp-c-brand-1, #4c6ef5);
}

.fl-panel {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed var(--vp-c-divider, rgba(128, 128, 128, 0.25));
}

.fl-doing {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 1.7;
}

.fl-meta {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .fl-meta {
    grid-template-columns: 1fr 1fr;
  }
}

.fl-label {
  display: block;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2, #888);
  margin-bottom: 2px;
}

.fl-value {
  font-size: 14px;
}

.fl-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
}

.fl-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
}

.fl-btn:hover {
  border-color: var(--vp-c-brand-1, #4c6ef5);
}

.fl-btn.primary {
  background: var(--vp-c-brand-1, #4c6ef5);
  border-color: var(--vp-c-brand-1, #4c6ef5);
  color: #fff;
}

.fl-count {
  font-size: 12px;
  color: var(--vp-c-text-2, #888);
  font-variant-numeric: tabular-nums;
}
</style>
