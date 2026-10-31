---
title: 案例一 · 番茄钟
icon: carbon:timer
permalink: /case-timer/
createTime: 2026/10/28 09:53:14
---

第一个案例制作一个极简本地番茄钟网页：25 分钟倒计时、开始/暂停/继续/重置、归零修改标题并累计今日完成数。没有多余的音频或设置页，专注跑通「想清楚 → 定计划 → 生成并运行 → 盯差量与修边界 → 检查并交付」的完整流程。

## 先看完成版

::::: demo title="完成版番茄钟" desc="四态状态机驱动，支持开始、暂停、继续和重置。今日完成数按本地日期保存在浏览器中，支持跨天自动归零与异常容错。"

:::: code-tabs

@tab HTML

```html
<main class="app">
  <div class="timer" id="timer">25:00</div>
  <div class="actions">
    <button type="button" class="btn btn--primary" id="primary">开始</button>
    <button type="button" class="btn" id="reset">重置</button>
  </div>
  <p class="count">今日完成：<span id="count">0</span> 次</p>
</main>
```

@tab CSS

```css
:root {
  --bg: #14151a;
  --fg: #ecebe8;
  --muted: #8a8a94;
  --line: #2b2c34;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px 24px;
  background: var(--bg);
  color: var(--fg);
  font-family: system-ui, -apple-system, sans-serif;
  border-radius: 16px;
}

.timer {
  font-size: clamp(48px, 14vw, 96px);
  font-weight: 300;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  min-width: 96px;
  padding: 10px 22px;
  font: inherit;
  font-size: 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color .15s, border-color .15s, background-color .15s;
}

.btn:hover { color: var(--fg); border-color: #43444e; }
.btn:active { transform: translateY(1px); }

.btn--primary {
  background: var(--fg);
  border-color: var(--fg);
  color: #14151a;
  font-weight: 500;
}

.btn--primary:hover { background: #fff; border-color: #fff; }

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.count {
  margin: -8px 0 0;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
```

@tab JavaScript

```js
const DURATION_SECONDS = 25 * 60;
const DEFAULT_TITLE = "番茄钟";
const REST_TITLE = "休息一下";
const STORAGE_KEY = "pomodoro.daily";

const timerEl = document.getElementById("timer");
const primaryBtn = document.getElementById("primary");
const resetBtn = document.getElementById("reset");
const countEl = document.getElementById("count");

let state = "idle"; // idle | running | paused | finished
let remaining = DURATION_SECONDS;
let intervalId = null;
let completedCount = 0;

const PRIMARY_LABEL = {
  idle: "开始",
  running: "暂停",
  paused: "继续",
  finished: "开始",
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function loadCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const saved = JSON.parse(raw);
    if (!saved || saved.date !== todayKey()) return 0;
    const count = Number(saved.count);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch {
    return 0;
  }
}

function saveCount() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), count: completedCount }));
  } catch {}
}

function render() {
  timerEl.textContent = formatTime(remaining);
  primaryBtn.textContent = PRIMARY_LABEL[state];
  primaryBtn.disabled = state === "finished";
  countEl.textContent = String(completedCount);
}

function startTicking() {
  clearInterval(intervalId);
  intervalId = setInterval(tick, 1000);
}

function stopTicking() {
  clearInterval(intervalId);
  intervalId = null;
}

function tick() {
  remaining -= 1;
  if (remaining <= 0) {
    stopTicking();
    remaining = 0;
    state = "finished";
    document.title = REST_TITLE;
    completedCount += 1;
    saveCount();
    render();
    return;
  }
  render();
}

function reset() {
  stopTicking();
  remaining = DURATION_SECONDS;
  state = "idle";
  document.title = DEFAULT_TITLE;
  render();
}

primaryBtn.addEventListener("click", () => {
  if (state === "idle" || state === "paused") {
    state = "running";
    startTicking();
    render();
  } else if (state === "running") {
    stopTicking();
    state = "paused";
    render();
  }
});

resetBtn.addEventListener("click", reset);

completedCount = loadCount();
render();
```

::::
:::::

## 与 Agent 的对话过程

这个案例不需要我们自己手写代码。我们通过 5 轮对话把需求交代给 Agent，并在关键节点完成了 6 次 Git 提交。

下面按顺序列出当时的对话截图、怎么向 Agent 提要求，以及每次生成的文件变化：

::::: timeline
- 步骤一 · 保存需求卡 · `e629d7c` docs: 建立番茄钟最简需求卡
  time="2026-10-28"

  - **怎么跟它说**：先告诉它想做个番茄钟，但明确说明“先不要写代码，先针对这个功能向我提问”，通过来回问答把功能边界梳理清楚。
  - **确认的要点**：固定 25 分钟倒计时，不做音频和复杂设置，只做单个 HTML 文件。

  ::: file-tree
  - pomodoro/
    - REQUIREMENT.md # 本轮生成：最简需求卡
  :::

  ![需求访谈实战对话：Agent 提问关键边界并生成 REQUIREMENT.md](/images/case-timer/case-timer-chat-1-requirement.png)

- 步骤二 · 保存实施计划 · `74b2ef9` docs: 建立三步实施计划
  time="2026-10-28"

  - **怎么跟它说**：让它根据需求卡拆解出实现步骤，要求每个步骤都要能单独验证，依然提醒它先不要动源码。
  - **确认的要点**：拆分成骨架、倒计时、数据保存三步，每步都有明确的手动测试方法。

  ::: file-tree
  - pomodoro/
    - REQUIREMENT.md
    - TODO.md # 本轮生成：三步实施清单
  :::

  ![制定实施计划实战对话：要求先给方案不写代码，生成 TODO.md](/images/case-timer/case-timer-chat-2-todo.png)

- 步骤三 · 任务一交付 · `17db13e` feat: 完成骨架搭建与静态样式
  time="2026-10-28"

  - **怎么跟它说**：派发第一步任务，明确要求这次只写网页骨架和 CSS 样式，不要写任何 JavaScript 逻辑脚本。
  - **确认的要点**：页面居中显示 25:00，`<script>` 标签数量为 0，双击文件就能在浏览器查看排版。

  ::: file-tree
  - pomodoro/
    - index.html # 本轮生成：纯静态页面与样式（暂无 JS 脚本）
    - REQUIREMENT.md
    - TODO.md
  :::

  ![任务一派发与交付对话：审查静态骨架与等宽样式](/images/case-timer/case-timer-chat-3-task1.png)

- 步骤四 · 任务二交付 · `6764dc2` feat: 实现核心倒计时与四态状态流转
  time="2026-10-28"

  - **怎么跟它说**：派发第二步任务，只实现倒计时和按钮状态切换。提醒它注意防抖，避免连续点击开始按钮导致倒计时越跑越快。
  - **确认的要点**：支持开始、暂停、继续和重置四种状态，倒计时归零停在 00:00 并修改网页标题。

  ::: file-tree
  - pomodoro/
    - index.html # 本轮修改：加入状态机与防加速定时器
    - REQUIREMENT.md
    - TODO.md
  :::

  ![任务二状态机与定时器对话：审查四态流转逻辑](/images/case-timer/case-timer-chat-4-task2.png)

- 步骤五 · 任务三交付 · `182358b` feat: 完成今日完成数持久化与跨天重置
  time="2026-10-28"

  - **怎么跟它说**：派发第三步任务，把今日完成次数存进浏览器。要求它只存完成数，不要存倒计时的秒数，并加上异常容错处理。
  - **确认的要点**：用 localStorage 记录当天完成次数，跨天自动归零；即使读取损坏数据也不会让页面报错。

  ::: file-tree
  - pomodoro/
    - index.html # 本轮修改：加入本地存储与容错降级
    - REQUIREMENT.md
    - TODO.md
  :::

  ![任务三派发与持久化对话（上）：需求说明与存储设计](/images/case-timer/case-timer-chat-5-task3-1.png)

  ![任务三派发与持久化对话（下）：容错降级与代码落地](/images/case-timer/case-timer-chat-5-task3-2.png)

- 步骤六 · 收尾与交付 · `dd0478a` chore: 忽略本地截图目录
  time="2026-10-28"

  - **怎么跟它说**：自己手动测试一遍各项功能，确认没问题后，让 Agent 创建 `.gitignore` 文件排除测试截图。
  - **确认的要点**：完成所有检查，仓库中只保留项目必需的文件。

  ::: file-tree
  - pomodoro/
    - index.html # 完整单文件实现（HTML + CSS + 原生 JS）
    - REQUIREMENT.md # 最简需求卡
    - TODO.md # 三步实施清单
    - .gitignore # 本轮生成：忽略测试截图目录
  :::

  ![验收与收工对话：完成检查并整理工程资产](/images/case-timer/case-timer-chat-6-finish.png)
:::::

::: tip 查看具体的代码与测试细节
时间线里重点展示了与 Agent 对话的过程。如果你想看每一步完整的提示词、代码改动差异以及具体的手动测试步骤，可以点击下方「下一页」按步骤阅读。
:::

## 开始之前：环境准备

确认 VS Code、Git 和 Agent 已完成配置。在终端中新建 `pomodoro` 目录并初始化 Git 仓库，然后用 VS Code 打开该工作区：

```bash title="初始化 pomodoro 项目目录"
mkdir -p ~/Code/pomodoro
cd ~/Code/pomodoro
git init
code .
```

![终端初始化与打开工作区](/images/case-timer/init-terminal.png)

用 VS Code 打开后，确认两处状态：
1. **左侧资源管理器**：当前打开的根目录是否为干净的 `pomodoro` 文件夹。
2. **右侧 Agent 侧边栏**：展开面板，确认处于 **Agent 模式**。

![VS Code 打开 pomodoro 目录并就绪 Pi Agent](/images/case-timer/vscode-pi-ready.png)

环境准备就绪后，点击下方「下一页」开始编写需求卡。
