<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { gates } from './gate-data'

const props = defineProps<{
  group: string
  title?: string
}>()

const group = computed(() => gates[props.group])
const checked = ref<boolean[]>([])
const ready = ref(false)

const storageKey = computed(() => `vibe-primer:gate:${props.group}`)

function init() {
  const items = group.value?.items ?? []
  let saved: unknown = null
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (raw) saved = JSON.parse(raw)
  } catch {
    saved = null
  }
  checked.value = items.map((_, i) =>
    Array.isArray(saved) ? Boolean((saved as boolean[])[i]) : false,
  )
  ready.value = true
}

onMounted(init)

watch(checked, (val) => {
  if (!ready.value) return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(val))
  } catch {
    // 隐私模式下写不进去，不影响使用
  }
}, { deep: true })

const total = computed(() => group.value?.items.length ?? 0)
const doneCount = computed(() => checked.value.filter(Boolean).length)
const percent = computed(() =>
  total.value === 0 ? 0 : Math.round((doneCount.value / total.value) * 100),
)
const allDone = computed(() => total.value > 0 && doneCount.value === total.value)

function toggle(i: number) {
  checked.value[i] = !checked.value[i]
}

function reset() {
  checked.value = checked.value.map(() => false)
}
</script>

<template>
  <div v-if="group" class="gate">
    <div class="gate-head">
      <div>
        <p class="gate-title">{{ title || group.title }}</p>
        <p v-if="group.intro" class="gate-intro">{{ group.intro }}</p>
      </div>
      <span class="gate-score" :class="{ full: allDone }">
        {{ doneCount }} / {{ total }}
      </span>
    </div>

    <div class="gate-bar" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div class="gate-bar-fill" :style="{ width: percent + '%' }" />
    </div>

    <ul class="gate-list">
      <li v-for="(item, i) in group.items" :key="i">
        <label class="gate-item" :class="{ done: checked[i] }">
          <input
            type="checkbox"
            :checked="checked[i]"
            @change="toggle(i)"
          >
          <span class="gate-box" aria-hidden="true" />
          <span class="gate-text">
            {{ item.t }}
            <span v-if="item.hint" class="gate-hint">{{ item.hint }}</span>
          </span>
        </label>
      </li>
    </ul>

    <div class="gate-foot">
      <span v-if="allDone" class="gate-all">全过了。可以往下走了。</span>
      <span v-else class="gate-left">还剩 {{ total - doneCount }} 项</span>
      <button class="gate-reset" @click="reset">清空重来</button>
    </div>
  </div>
</template>

<style scoped>
.gate {
  margin: 22px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  border-radius: 12px;
}

.gate-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.gate-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.gate-intro {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2, #888);
}

.gate-score {
  flex: none;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-2, #888);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-default-soft, rgba(128, 128, 128, 0.12));
}

.gate-score.full {
  color: #fff;
  background: var(--vp-c-brand-1, #4c6ef5);
}

.gate-bar {
  height: 4px;
  margin: 14px 0 6px;
  border-radius: 999px;
  background: var(--vp-c-default-soft, rgba(128, 128, 128, 0.16));
  overflow: hidden;
}

.gate-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--vp-c-brand-1, #4c6ef5);
  transition: width 0.25s ease;
}

.gate-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.gate-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 7px 0;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.65;
}

.gate-item input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.gate-box {
  flex: none;
  width: 17px;
  height: 17px;
  margin-top: 3px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.4));
  transition: background 0.15s, border-color 0.15s;
  position: relative;
}

.gate-item.done .gate-box {
  background: var(--vp-c-brand-1, #4c6ef5);
  border-color: var(--vp-c-brand-1, #4c6ef5);
}

.gate-item.done .gate-box::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.gate-item.done .gate-text {
  color: var(--vp-c-text-3, #999);
  text-decoration: line-through;
  text-decoration-color: var(--vp-c-divider, rgba(128, 128, 128, 0.5));
}

.gate-hint {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-2, #888);
  margin-top: 2px;
}

.gate-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2, #888);
}

.gate-all {
  color: var(--vp-c-brand-1, #4c6ef5);
}

.gate-reset {
  border: none;
  background: none;
  color: var(--vp-c-text-3, #999);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
}

.gate-reset:hover {
  color: var(--vp-c-brand-1, #4c6ef5);
}
</style>
