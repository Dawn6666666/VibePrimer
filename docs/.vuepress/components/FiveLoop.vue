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
    doing: '明确使用场景、输入数据、界面输出与硬性约束，排除本版不做的事项。',
    output: '一份 REQUIREMENT.md 需求卡',
    done: '每条核心需求都配有明确的手动验证操作与预期结果',
  },
  {
    key: 'plan',
    title: '定计划',
    doing: '让 Agent 先读取需求，拆分文件职责与实现顺序，暂不修改代码。',
    output: 'TODO.md 任务清单，按依赖关系排序',
    done: '任务拆分为单次可独立验证的粒度，无多余未规划文件',
  },
  {
    key: 'build',
    title: '生成并运行',
    doing: '单次只派发一项具体任务，审查代码 Diff 确认无越权修改后在本地运行。',
    output: '单一功能修改的代码与一次 Git 提交',
    done: '功能在浏览器中运行正常，明确知道改动的代码行与作用',
  },
  {
    key: 'fix',
    title: '定位并修改',
    doing: '记录控制台报错与稳定复现路径，逐个排查假设并修改代码。',
    output: '修复后的代码与原因记录',
    done: '原复现操作不再出错，既有相关功能通过回归测试',
  },
  {
    key: 'ship',
    title: '检查并交付',
    doing: '脱离开发环境，按说明文件在无痕窗口或全新目录下完整走通自测。',
    output: '完备的 README.md 与通过自测的项目产物',
    done: '他人仅凭说明文件即可独立克隆、启动并正常使用',
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
          <span class="fl-label">交付产物</span>
          <span class="fl-value">{{ step.output }}</span>
        </div>
        <div>
          <span class="fl-label">验收标准</span>
          <span class="fl-value">{{ step.done }}</span>
        </div>
      </div>
      <div class="fl-actions">
        <button class="fl-btn" @click="go(current - 1)">上一步</button>
        <span class="fl-count">{{ current + 1 }} / {{ steps.length }}</span>
        <button class="fl-btn primary" @click="go(current + 1)">
          {{ current === steps.length - 1 ? '回到第 1 步' : '下一步' }}
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
