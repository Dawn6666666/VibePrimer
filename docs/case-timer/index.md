---
title: 案例一 · 番茄钟
icon: carbon:timer
permalink: /case-timer/
createTime: 2026/10/28 09:53:14
---

第一个案例只做一个本地网页：25 分钟倒计时、开始/暂停/继续、重置和今日完成数。功能不多，但会经过需求、计划、生成、调试和交付的完整过程。

## 先看完成版

::::: demo title="完成版番茄钟" desc="可以开始、暂停、继续和重置。今日完成数会按日期保存在当前浏览器中。"

:::: code-tabs

@tab HTML

```html
<div class="wrap">
  <div id="display">25:00</div>
  <div class="row">
    <button id="toggle">开始</button>
    <button id="reset">重置</button>
  </div>
  <p class="today">今日完成 <span id="count">0</span> 个</p>
</div>
```

@tab CSS

```css
body {
  margin: 0;
  padding: 32px 16px;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0f1115;
  color: #e8ecf3;
}
.wrap { text-align: center; }
#display {
  font-size: clamp(48px, 14vw, 72px);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}
button {
  padding: 10px 24px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #2b3140;
  background: #1a1f2b;
  color: #e8ecf3;
  cursor: pointer;
}
button:hover { background: #232a38; }
.today { margin-top: 28px; color: #8b95a7; font-size: 14px; }
```

@tab JavaScript

```js
const TOTAL = 25 * 60
const KEY = 'pomo-today-v1'
const display = document.querySelector('#display')
const toggle = document.querySelector('#toggle')
const reset = document.querySelector('#reset')
const countEl = document.querySelector('#count')

let remain = TOTAL
let endAt = 0
let tick = null
let running = false

function today() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function loadToday() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    if (data && data.date === today() && Number.isInteger(data.count) && data.count >= 0) {
      return data.count
    }
  } catch {
    // 存储不可用或内容损坏时，页面仍可以计时
  }
  return 0
}

let currentDate = today()
let done = loadToday()
countEl.textContent = done

function saveToday() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ date: currentDate, count: done }))
  } catch {
    // 本次页面内继续计数，但不承诺持久保存
  }
}

function render() {
  const m = String(Math.floor(remain / 60)).padStart(2, '0')
  const s = String(remain % 60).padStart(2, '0')
  display.textContent = `${m}:${s}`
  document.title = `${m}:${s} · 番茄钟`
}

function clearTick() {
  clearInterval(tick)
  tick = null
}

function finish() {
  running = false
  clearTick()
  remain = 0
  render()

  if (today() !== currentDate) {
    currentDate = today()
    done = 0
  }
  done += 1
  saveToday()
  countEl.textContent = done
  document.title = '休息一下'
  toggle.textContent = '开始'
}

function update() {
  remain = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
  if (remain === 0) return finish()
  render()
}

function start() {
  if (running) return
  if (remain === 0) remain = TOTAL
  running = true
  endAt = Date.now() + remain * 1000
  toggle.textContent = '暂停'
  tick = setInterval(update, 250)
  update()
}

function pause() {
  if (!running) return
  remain = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
  if (remain === 0) return finish()
  running = false
  clearTick()
  toggle.textContent = '继续'
  render()
}

toggle.addEventListener('click', () => {
  if (running) pause()
  else start()
})

reset.addEventListener('click', () => {
  running = false
  clearTick()
  remain = TOTAL
  toggle.textContent = '开始'
  render()
})

render()
```

::::
:::::

本地项目把 HTML、CSS 和 JavaScript 放进同一个 `index.html`，页签只是为了方便阅读。完成版约百行，无外部依赖，可以直接双击打开。

## 每一步练什么

| 步骤 | 内容 | 页面 |
| --- | --- | --- |
| 想清楚 | 写需求卡，确定刷新、归零和计数规则 | [需求卡](/case-timer/requirement/) |
| 定计划 | 审查文件、任务顺序和额外功能 | [先交方案](/case-timer/prompt/) |
| 生成并运行 | 查看 diff，运行并记录实际行为 | [跑起来](/case-timer/run/) |
| 发现问题并修改 | 处理重复定时器、后台计时和本地存储 | [调试](/case-timer/bug/) |
| 检查并交付 | 功能验收、边界测试和 README | [交付](/case-timer/finish/) |

## 为什么选这个项目

番茄钟包含三类常见问题。定时功能要考虑浏览器后台节流；开始、暂停和归零涉及状态转换；今日完成数涉及本地保存、数据格式和日期变化。后面做其他页面时，这些问题还会以不同形式出现。

参考用时约 2.5 小时，不包含环境安装。第一次做如果更慢，可以先完成当前小步骤，不必压缩验收时间。

## 开始之前

确认 VS Code、Git 和 Agent 已按第 0 章完成验收。Git 只需要安装并配置作者信息，项目仓库现在创建。

在 `vibe-lab` 下新建 `pomodoro`，用 VS Code 打开这个项目文件夹，然后在终端执行：

```bash
git init
```

再新建 `.gitignore`，至少写入 `.env` 和 `.DS_Store`。本项目不需要 `node_modules`，但以后使用依赖时也应忽略它。

[下一步：写需求卡](/case-timer/requirement/){.read-more}
