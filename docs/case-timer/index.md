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

## 最终交付物与目录结构

整个案例最终交付 3 个核心文件与 1 个忽略规则，纯前端原生实现，无 node_modules、无构建打包，任意浏览器双击直接运行：

:::: file-tree
- pomodoro/
  - index.html # 单文件全部实现（HTML + 内联 CSS + 原生 JS）
  - REQUIREMENT.md # 第一步：Agent 访谈收敛出的最简需求卡
  - TODO.md # 第二步：拆分的三步实施计划与手动验收方案
  - .gitignore # 收尾：忽略本地开发截图与临时目录
::::

## 全流程 Git 提交历史

每次需求变更、计划确定或单任务交付，都对应一次清晰的 Git 提交。以下是项目开发的完整提交历史：

::::: timeline
- 保存需求 · `e629d7c` docs: 建立番茄钟最简需求卡
  time="2026-10-28"

  - 通过结构化需求访谈，锁定 25 分钟倒计时与单文件交付
  - 明确拒绝音频、图表与复杂设置，确立三条验收基准

  :::: details 展开查看代码 Diff 与文件结构
  ::: file-tree
  - pomodoro/
    - REQUIREMENT.md # 需求文档（新增）
  :::

  ```markdown title="REQUIREMENT.md 核心要点"
  # 番茄钟最简需求卡
  - 运行模式：单文件 index.html，双击 file:// 直接运行，零外部依赖
  - 状态流转：idle / running / paused / finished 四态状态机
  - 倒计时规则：固定 25 分钟（1500 秒），归零停在 00:00，标题变「休息一下」
  - 持久化要求：localStorage 存储「今日完成数」，跨天自动归零，容错降级
  - 严禁项：不做音频、不做桌面通知权限、不做 Todo 清单、不做历史图表
  ```
  ::::

- 保存计划 · `74b2ef9` docs: 建立三步实施计划
  time="2026-10-28"

  - 拆分为骨架搭建、倒计时状态流转、持久化计数三个微任务
  - 明确禁止提前写代码，为每个任务预设手动验收操作

  :::: details 展开查看代码 Diff 与文件结构
  ::: file-tree
  - pomodoro/
    - REQUIREMENT.md
    - TODO.md # 三步拆解与自测方案（新增）
  :::

  ```markdown title="TODO.md 实施计划核心清单"
  - [ ] 任务一：骨架搭建与静态样式
    - 验收：单文件打开居中显示 25:00，<script> 数量为 0，样式等宽防抖
  - [ ] 任务二：核心倒计时与四态状态流转
    - 验收：单定时器防连击，四态正确流转，归零标题更新并停在 00:00
  - [ ] 任务三：今日完成数持久化与跨天重置
    - 验收：localStorage 记录次数，跨天与损坏 JSON 优雅容错降级
  ```
  ::::

- 任务一交付 · `17db13e` feat: 完成骨架搭建与静态样式
  time="2026-10-28"

  - 交付干净的单文件静态骨架，使用 flex 全屏居中与 tabular-nums
  - `<script>` 数量为 0，仅包含静态 HTML 和样式

  :::: details 展开查看代码 Diff 与文件结构
  ::: file-tree
  - pomodoro/
    - index.html # 静态骨架与样式（新增，+102 行）
    - REQUIREMENT.md
    - TODO.md
  :::

  ```diff title="index.html 核心骨架变更"
  + <div class="timer-display" id="timer">25:00</div>
  + <div class="btn-group">
  +   <button id="primary" class="btn primary">开始</button>
  +   <button id="reset" class="btn secondary">重置</button>
  + </div>
  + <div class="count-display">今日完成：<span id="count">0</span> 次</div>
  ```

  ```css title="tabular-nums 防抖等宽与自适应核心样式"
  .timer-display {
    font-variant-numeric: tabular-nums; /* 数字等宽，秒数跳动时不左右抖动 */
    font-size: clamp(72px, 18vw, 152px); /* 响应式自适应大字号 */
  }
  ```
  ::::

- 任务二交付 · `6764dc2` feat: 实现核心倒计时与四态状态流转
  time="2026-10-28"

  - 接入四态状态机（idle / running / paused / finished）
  - 单定时器防抖防加速，归零停在 00:00 并自动更新网页标题

  :::: details 展开查看代码 Diff 与文件结构
  ::: file-tree
  - pomodoro/
    - index.html # 注入状态机与定时器逻辑（修改，+68 行）
  :::

  ```diff title="index.html 状态机与防加速定时器 Diff"
  + const STATES = { idle: '开始', running: '暂停', paused: '继续', finished: '开始' };
  + let state = 'idle', remainingSeconds = 1500, intervalId = null;
  + 
  + function startTicking() {
  +   clearInterval(intervalId); // 连击防抖：清理旧定时器，防止越点越快
  +   intervalId = setInterval(tick, 1000);
  + }
  + function tick() {
  +   --remainingSeconds;
  +   if (remainingSeconds <= 0) {
  +     clearInterval(intervalId); intervalId = null;
  +     state = 'finished';
  +     document.title = '休息一下';
  +   }
  +   render();
  + }
  ```
  ::::

- 任务三交付 · `182358b` feat: 完成今日完成数持久化与跨天重置
  time="2026-10-28"

  - 单 key 存储今日完成数，按本地时区计算当天日期
  - 实现损坏 JSON 与隐私模式的三层容错降级，不持久化倒计时进度

  :::: details 展开查看代码 Diff 与文件结构
  ::: file-tree
  - pomodoro/
    - index.html # 接入本地持久化与容错降级（修改，+35 行）
  :::

  ```diff title="index.html localStorage 与容错降级 Diff"
  + const STORAGE_KEY = 'pomodoro.daily';
  + function getTodayCount() {
  +   try {
  +     const raw = localStorage.getItem(STORAGE_KEY);
  +     if (!raw) return 0;
  +     const parsed = JSON.parse(raw);
  +     return (parsed && parsed.date === getLocalDateStr()) ? (Number(parsed.count) || 0) : 0;
  +   } catch {
  +     return 0; // 损坏 JSON、隐私模式或禁用 Storage 时优雅降级为 0
  +   }
  + }
  ```
  ::::

- 收尾交付 · `dd0478a` chore: 忽略本地截图目录
  time="2026-10-28"

  - 新建 .gitignore 隔离过程开发资产，完成项目交付验收

  :::: details 展开查看代码 Diff 与文件结构
  ::: file-tree
  - pomodoro/
    - index.html
    - REQUIREMENT.md
    - TODO.md
    - .gitignore # 忽略本地测试截图目录（新增，+1 行）
  :::

  ```diff title=".gitignore"
  + imgs/
  ```
  ::::
:::::

## 五步实战演练路线

按照真实的执行节奏，跟随以下五步亲手演练：

::: steps
1. **[第一步：想清楚（把它问清楚）](/case-timer/requirement/)**
   - 通过 10 个关键问题明确边界，生成 `REQUIREMENT.md` 并完成首次提交。

2. **[第二步：定计划（让它先交方案）](/case-timer/prompt/)**
   - 让 Agent 将实现拆解为三步任务与验收动作，生成 `TODO.md`。

3. **[第三步：生成并运行（单任务推进）](/case-timer/run/)**
   - 实现任务一，只包含静态骨架与排版，完成浏览器直测并提交。

4. **[第四步：盯差量与修边界（调试与防御）](/case-timer/bug/)**
   - 推进任务二与任务三，审查状态机流转、防定时器连击加速、本地时区与容错降级。

5. **[第五步：检查与交付（全量验收与收工）](/case-timer/finish/)**
   - 执行 8 项验收测试，配置 .gitignore，检视完整的 Git 提交历史。
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
