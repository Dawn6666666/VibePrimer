<script setup lang="ts">
const roads = [
  {
    no: '01',
    when: '电脑上还什么都没有',
    title: '第 0 章 · 准备',
    desc: '装 VS Code、接一个编程 Agent、把 Git 当游戏存档。末尾有一张九项验收表，全勾完再往下走。',
    link: '/start/what/',
    time: '约 60 分钟',
  },
  {
    no: '02',
    when: '想先看一遍完整的',
    title: '案例一 · 番茄钟',
    desc: '从一句「做个番茄钟」走到一个能交出去的单文件作品。中间踩四次坑、修四次，每一步都摊开写。',
    link: '/case-timer/',
    time: '约 2.5 小时',
  },
  {
    no: '03',
    when: '想先把话说清楚',
    title: '手艺库',
    desc: '提示词、上下文、读代码、测试、安全。这五页不教语法，决定的是你后面所有项目的上限。',
    link: '/craft/prompt/',
    time: '随时翻',
  },
]
</script>

<template>
  <section class="home-read">
    <div class="hr-inner">
      <p class="hr-eyebrow">怎么读</p>
      <h2 class="hr-title">按你现在的状态，挑一条</h2>
      <p class="hr-sub">
        三条路没有先后要求，但第三条是长期的。前两条走完，你手上会有一个能给别人看的作品。
      </p>

      <div class="hr-grid">
        <a v-for="r in roads" :key="r.no" class="hr-card" :href="r.link">
          <div class="hr-head">
            <span class="hr-no">{{ r.no }}</span>
            <span class="hr-time">{{ r.time }}</span>
          </div>
          <p class="hr-when">{{ r.when }}</p>
          <h3 class="hr-name">{{ r.title }}</h3>
          <p class="hr-desc">{{ r.desc }}</p>
          <span class="hr-go">走这条 →</span>
        </a>
      </div>

      <p class="hr-quote">
        生成代码不是完成任务。让它跑起来、你能解释每一行为什么在那、别人能照着用起来 —— 才算。
      </p>
    </div>
  </section>
</template>

<style scoped>
.home-read {
  padding: 72px 24px 88px;
}

.hr-inner {
  max-width: 1080px;
  margin: 0 auto;
}

.hr-eyebrow {
  margin: 0 0 12px;
  font-size: 13px;
  letter-spacing: 0.18em;
  color: var(--vp-c-brand-1, #3b6ef0);
  text-transform: uppercase;
}

.hr-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.hr-sub {
  margin: 14px 0 0;
  max-width: 40em;
  font-size: 15px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.hr-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 36px;
}

.hr-card {
  display: block;
  padding: 22px 22px 18px;
  border: 1px solid var(--vp-c-divider, rgba(128, 128, 128, 0.24));
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.hr-card:hover {
  border-color: var(--vp-c-brand-1, #3b6ef0);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.hr-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.hr-no {
  font-family: var(--vp-font-mono, ui-monospace, monospace);
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.hr-time {
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-default-soft, rgba(128, 128, 128, 0.12));
}

.hr-when {
  margin: 16px 0 4px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.hr-name {
  margin: 0;
  font-size: 17px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.hr-desc {
  margin: 10px 0 18px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.hr-go {
  font-size: 13px;
  color: var(--vp-c-brand-1, #3b6ef0);
}

.hr-quote {
  margin: 44px 0 0;
  padding-left: 18px;
  border-left: 3px solid var(--vp-c-brand-1, #3b6ef0);
  font-size: 15px;
  line-height: 1.9;
  color: var(--vp-c-text-1);
}

@media (max-width: 860px) {
  .home-read {
    padding: 56px 18px 64px;
  }

  .hr-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 28px;
  }

  .hr-title {
    font-size: 23px;
  }
}
</style>
