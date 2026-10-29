<script setup lang="ts">
import { ref } from 'vue'

const isThinkingExpanded = ref(false)

function toggleThinking() {
  isThinkingExpanded.value = !isThinkingExpanded.value
}
</script>

<template>
  <div class="pi-chat-window">
    <!-- VS Code 侧边栏/对话面板顶栏 -->
    <div class="pi-chat-topbar">
      <div class="pi-chat-tabs">
        <div class="pi-chat-tab active">
          <span class="tab-label">聊天</span>
          <span class="tab-badge">
            <span class="pi-symbol">π</span>
            <span class="pi-name">Pi</span>
          </span>
        </div>
      </div>
      <div class="pi-chat-actions" aria-hidden="true">
        <button class="pi-action-btn" title="新建会话">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
          </svg>
        </button>
        <button class="pi-action-btn" title="清空会话">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
        <button class="pi-action-btn" title="搜索">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
        <button class="pi-action-btn" title="更多操作">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 对话消息列表 -->
    <div class="pi-chat-body">
      <!-- 消息 1: You 用户提问 -->
      <div class="pi-msg-row user">
        <div class="pi-msg-header">
          <span class="user-name">You</span>
        </div>
        <div class="pi-msg-bubble user-bubble">
          我要做一个本地番茄钟网页，双击就能打开。先不要写代码。最多问我 10 个会影响实现的问题，一次列完。不要问配色和字体，问题按重要性排序。
        </div>
      </div>

      <!-- 消息 2: Pi Agent 回答 -->
      <div class="pi-msg-row agent">
        <div class="pi-msg-header">
          <span class="pi-avatar-icon">π</span>
          <span class="pi-author-name">Pi</span>
        </div>

        <!-- 模拟真实 Thinking 思考折叠过程 -->
        <div class="pi-thinking-box" :class="{ expanded: isThinkingExpanded }" @click="toggleThinking">
          <div class="pi-thinking-header">
            <span class="pi-thinking-arrow">{{ isThinkingExpanded ? '▼' : '▶' }}</span>
            <span class="pi-thinking-title">Thinking</span>
            <span class="pi-thinking-hint">{{ isThinkingExpanded ? '（点击收起）' : '（点击展开思考过程）' }}</span>
          </div>
          <div v-show="isThinkingExpanded" class="pi-thinking-content">
            <p>1. <strong>识别核心场景</strong>：用户要做本地番茄钟网页，要求「双击即开」。直接使用 <code>file://</code> 协议运行时，浏览器的 CORS 限制会阻断外部 ES Module、fetch、CSS/JSON 文件加载，因此必须明确是单文件内联还是多文件。</p>
            <p>2. <strong>排查状态流转与边界隐患</strong>：后台标签页节流（Timer Throttle）、系统休眠、刷新网页对倒计时和持久化数据的破坏性影响。</p>
            <p>3. <strong>收敛功能蔓延</strong>：排除番茄钟最容易失控的过度设计（音频、桌面通知权限、多轮休息、任务列表、历史图表等）。</p>
            <p>4. <strong>生成 10 个按影响程度由大到小排序的确定性问题</strong>，强制先访谈确认，坚守不提前写代码原则。</p>
          </div>
        </div>

        <!-- Agent 正文内容 -->
        <div class="pi-agent-content">
          <p class="intro-line">10 个问题，按实现的影响从大到小排列：</p>
          <ol class="question-list">
            <li>
              <strong>单文件还是多文件？</strong>
              双击打开即 <code>file://</code> 协议，<code>fetch</code>、ES module、外部 JSON/CSS 加载都会被浏览器拦截。选「单个 index.html 内联全部代码」（最稳，双击即用）还是「多文件 + 一个启动脚本/本地服务器」？
            </li>
            <li>
              <strong>计时规则怎么定？</strong>
              经典 25 分钟专注 + 5 分钟短休、每 4 轮一次 15–30 分钟长休？还是你自己要一套（比如 50/10）？这些时长需要在界面上可改吗？
            </li>
            <li>
              <strong>刷新/关闭后要不要记住状态？</strong>
              比如专注到第 12 分钟关掉页面，重新打开是 ①恢复剩余时间继续跑 ②恢复但暂停 ③清空重来。这决定要不要用 <code>localStorage</code> 存时间戳。
            </li>
            <li>
              <strong>后台/睡眠时计时必须准确吗？</strong>
              浏览器会节流隐藏标签页的定时器，电脑睡眠会直接停表。用「记录结束时间戳、每次渲染按差值算」能保证切回来是准的；如果要求睡眠期间也算真实时间，规则还要额外定义。
            </li>
            <li>
              <strong>阶段结束时怎么提醒？</strong>
              要桌面通知（需要首次授权，<code>file://</code> 下 Chrome 对通知有限制）、提示音（内置短音频还是 WebAudio 合成）、还是只靠页面闪动/标题变化？
            </li>
            <li>
              <strong>要不要任务清单？</strong>
              纯计时器，还是可以把「写周报」「复习」这类任务挂在番茄上、统计每个任务吃了几个番茄？这会让数据结构和界面复杂度上一个台阶。
            </li>
            <li>
              <strong>要统计历史吗？</strong>
              只显示「今天完成 N 个」就够，还是要按天/周看图表、连续打卡天数？数据存哪（<code>localStorage</code> 清缓存就没了，需要导出吗）？
            </li>
            <li>
              <strong>流程自动化到哪一步？</strong>
              专注结束自动进入休息、休息结束自动开始下一轮，还是每步都要手动点开始？有没有「跳过当前阶段」「重置」「一键暂停全部」？
            </li>
            <li>
              <strong>界面要展示什么？</strong>
              只有大号倒计时 + 开始/暂停，还是要环形进度条、当前第几轮（●●●○）、当前任务名、今日已完成的番茄点阵？另外要不要把剩余时间显示在浏览器标签页标题上（切到别的标签也能瞄一眼）？
            </li>
            <li>
              <strong>只在 Chrome/Edge 上用吗？</strong>
              需要兼容 Safari / 手机浏览器吗？这会影响通知、音频解锁（Safari 需要用户手势后才能播声音）等 API 的写法。
            </li>
          </ol>
          <div class="closing-quote">
            回答完这 10 个我就直接开始写；如果某些想让我按默认来，直接说「1 选 a，其余默认」也行。
          </div>
        </div>
      </div>

      <!-- 消息 3: You 用户最终确定性答复 -->
      <div class="pi-msg-row user">
        <div class="pi-msg-header">
          <span class="user-name">You</span>
        </div>
        <div class="pi-msg-bubble user-bubble">
          <p class="reply-intro">这只是一个教学演示 Demo，一切保持最简，拒绝过度设计：</p>
          <ol class="reply-list">
            <li><strong>单文件</strong>：单个 <code>index.html</code> 内联全部样式与脚本，双击即开。</li>
            <li><strong>规则</strong>：固定 25 分钟倒计时，不做设置页，不做休息倒计时。</li>
            <li><strong>界面只有三样东西</strong>：大号时间（<code>25:00</code>）、主按钮（开始/暂停/继续）、重置按钮。</li>
            <li><strong>数据与完成</strong>：归零时停在 <code>00:00</code>，网页标题改为「休息一下」，今日完成数 +1（存 <code>localStorage</code>）。刷新页面回到 <code>25:00</code>。</li>
            <li><strong>排除项</strong>：不做音频、不做桌面通知、不做 Todo 任务列表、不做图表。</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-chat-window {
  width: 100%;
  margin: 24px 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  box-shadow: var(--vp-shadow-2);
  overflow: hidden;
  font-family: var(--vp-font-family-base);
}

/* 顶部 Tab 栏 */
.pi-chat-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 12px;
  background-color: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-border);
}

.pi-chat-tabs {
  display: flex;
  align-items: center;
  height: 100%;
}

.pi-chat-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 12px;
  border-bottom: 2px solid var(--vp-c-brand-1, #4c6ef5);
  background-color: var(--vp-c-bg-soft);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  background-color: rgba(234, 88, 12, 0.12);
  color: #ea580c;
  font-size: 12px;
  font-weight: 700;
}

.pi-symbol {
  font-family: Georgia, serif;
  font-size: 13px;
}

.pi-chat-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pi-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pi-action-btn:hover {
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

/* 消息流主体 */
.pi-chat-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background-color: var(--vp-c-bg);
}

.pi-msg-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.pi-msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.user-name {
  color: var(--vp-c-text-2);
}

.pi-avatar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: #fff;
  font-family: Georgia, serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.pi-author-name {
  font-weight: 700;
  color: #ea580c;
}

/* 用户气泡卡片 */
.user-bubble {
  padding: 12px 16px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.reply-intro {
  margin: 0 0 8px;
  font-weight: 600;
}

.reply-list {
  margin: 0;
  padding-left: 18px;
}

.reply-list li {
  margin: 4px 0;
  line-height: 1.65;
}

/* 思考折叠条 */
.pi-thinking-box {
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, background-color 0.2s;
}

.pi-thinking-box:hover {
  border-color: var(--vp-c-brand-1, #4c6ef5);
}

.pi-thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  user-select: none;
}

.pi-thinking-arrow {
  font-size: 10px;
}

.pi-thinking-title {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.pi-thinking-hint {
  font-size: 11px;
}

.pi-thinking-content {
  padding: 10px 16px 12px;
  border-top: 1px dashed var(--vp-c-border);
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-mute);
}

.pi-thinking-content p {
  margin: 6px 0;
}

/* Agent 回答正文 */
.pi-agent-content {
  padding: 0 4px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-1);
}

.intro-line {
  margin: 6px 0 12px;
  font-weight: 600;
}

.question-list {
  margin: 0;
  padding-left: 20px;
}

.question-list li {
  margin: 10px 0;
  line-height: 1.7;
}

.question-list strong {
  color: var(--vp-c-text-1);
}

.closing-quote {
  margin-top: 16px;
  padding: 10px 14px;
  border-left: 3px solid var(--vp-c-brand-1, #4c6ef5);
  background-color: var(--vp-c-bg-soft);
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* 行内代码样式统一 */
.pi-chat-body code {
  padding: 2px 5px;
  margin: 0 2px;
  font-size: 0.9em;
  background-color: var(--vp-c-default-soft);
  border-radius: 4px;
  color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .pi-chat-body {
    padding: 14px 14px;
  }
}
</style>
