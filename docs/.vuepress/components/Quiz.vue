<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    q: string
    a: string
    b: string
    c?: string
    d?: string
    correct: 'a' | 'b' | 'c' | 'd'
    why?: string
  }>(),
  { c: '', d: '', why: '' },
)

const picked = ref<string>('')

const options = computed(() =>
  [
    { key: 'a', text: props.a },
    { key: 'b', text: props.b },
    { key: 'c', text: props.c },
    { key: 'd', text: props.d },
  ].filter((o) => o.text),
)

const isRight = computed(() => picked.value === props.correct)

function pick(key: string) {
  if (picked.value) return
  picked.value = key
}

function retry() {
  picked.value = ''
}
</script>

<template>
  <div class="quiz">
    <p class="quiz-q">{{ q }}</p>
    <div class="quiz-options">
      <button
        v-for="o in options"
        :key="o.key"
        class="quiz-option"
        :class="{
          right: picked && o.key === correct,
          wrong: picked === o.key && o.key !== correct,
          muted: picked && o.key !== correct && picked !== o.key,
        }"
        :disabled="Boolean(picked)"
        @click="pick(o.key)"
      >
        <span class="quiz-key">{{ o.key.toUpperCase() }}</span>
        <span class="quiz-text">{{ o.text }}</span>
      </button>
    </div>

    <div v-if="picked" class="quiz-result" :class="{ ok: isRight }">
      <p class="quiz-verdict">{{ isRight ? '对。' : '不对。' }}</p>
      <p v-if="why" class="quiz-why">{{ why }}</p>
      <button v-if="!isRight" class="quiz-retry" @click="retry">再试一次</button>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  margin: 22px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  border-radius: 12px;
}

.quiz-q {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.7;
}

.quiz-options {
  display: grid;
  gap: 8px;
}

.quiz-option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  text-align: left;
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  background: transparent;
  color: inherit;
  font-size: 14px;
  line-height: 1.6;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, opacity 0.15s;
}

.quiz-option:not(:disabled):hover {
  border-color: var(--vp-c-brand-1, #4c6ef5);
}

.quiz-key {
  flex: none;
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  border-radius: 5px;
  font-size: 11px;
  background: var(--vp-c-default-soft, rgba(128, 128, 128, 0.14));
  color: var(--vp-c-text-2, #888);
}

.quiz-option.right {
  border-color: #2f9e44;
  background: color-mix(in srgb, #2f9e44 10%, transparent);
}

.quiz-option.right .quiz-key {
  background: #2f9e44;
  color: #fff;
}

.quiz-option.wrong {
  border-color: #e03131;
  background: color-mix(in srgb, #e03131 10%, transparent);
}

.quiz-option.wrong .quiz-key {
  background: #e03131;
  color: #fff;
}

.quiz-option.muted {
  opacity: 0.55;
}

.quiz-result {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--vp-c-divider, rgba(128, 128, 128, 0.25));
  font-size: 14px;
  line-height: 1.7;
}

.quiz-verdict {
  margin: 0 0 4px;
  font-weight: 600;
  color: #e03131;
}

.quiz-result.ok .quiz-verdict {
  color: #2f9e44;
}

.quiz-why {
  margin: 0;
  color: var(--vp-c-text-2, #888);
}

.quiz-retry {
  margin-top: 10px;
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 7px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.3));
  background: transparent;
  color: inherit;
  cursor: pointer;
}
</style>
