---
title: 案例一 · 番茄钟
icon: carbon:timer
permalink: /case-timer/
createTime: 2026/10/28 09:53:14
---

这是你的第一圈，完整的。

项目本身很小：一个网页，25 分钟倒计时，两个按钮。小到你能在一个下午读完它的每一行。**小是有意的**——这一章要练的不是功能，是循环本身。

## 你会做出什么

先看成品。这是最终版本，可以点：

:::: demo title="完成版番茄钟" desc="点开始、暂停、重置。数字下面那行是今日完成数，刷新页面它也还在。"

::: code-tabs

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
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0f1115;
  color: #e8ecf3;
}
.wrap { text-align: center; }
#display {
  font-size: 72px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}
.row { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
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
const display = document.querySelector('#display')
const toggle = document.querySelector('#toggle')
const reset = document.querySelector('#reset')
const countEl = document.querySelector('#count')

let remain = TOTAL          // 剩余秒数
let endAt = 0               // 结束的时间戳
let tick = null
let running = false

// 今日完成数，存在本地
let done = Number(localStorage.getItem('pomo-done') || 0)
countEl.textContent = done

function render() {
  const m = String(Math.floor(remain / 60)).padStart(2, '0')
  const s = String(remain % 60).padStart(2, '0')
  document.title = `${m}:${s} · 番茄钟`
  display.textContent = `${m}:${s}`
}

function stop() {
  running = false
  clearInterval(tick)
  tick = null
  toggle.textContent = '继续'
}

function finish() {
  stop()
  remain = 0
  render()
  done += 1
  localStorage.setItem('pomo-done', done)
  countEl.textContent = done
  document.title = '休息一下'
  toggle.textContent = '开始'
  remain = TOTAL
}

function start() {
  running = true
  endAt = Date.now() + remain * 1000
  toggle.textContent = '暂停'
  // 每 250ms 用时间戳算一次剩余，切走标签页也不会变慢
  tick = setInterval(() => {
    remain = Math.max(0, Math.round((endAt - Date.now()) / 1000))
    if (remain === 0) return finish()
    render()
  }, 250)
}

toggle.addEventListener('click', () => {
  if (running) stop()
  else start()
})

reset.addEventListener('click', () => {
  stop()
  remain = TOTAL
  document.title = '番茄钟'
  toggle.textContent = '开始'
  render()
})

render()
```

:::
::::

一个文件，七十来行，没有依赖，双击就能开。

## 用哪些东西，练什么

| 这一圈的步骤 | 你会练到 | 在哪看 |
| --- | --- | --- |
| 想清楚 | 把"做个番茄钟"变成 6 条验收标准 | [需求卡](/case-timer/requirement/) |
| 定计划 | 审一份 AI 给的计划，砍掉两个多余的文件 | [第一句话](/case-timer/prompt/) |
| 生成并运行 | 一次一条任务，看 diff，跑起来 | [跑起来](/case-timer/run/) |
| 发现问题并修改 | 抓三个真实的 bug，其中一个要你亲手复现 | [三个 bug](/case-timer/bug/) |
| 检查并交付 | 边界测试、README、交付包 | [交付](/case-timer/finish/) |

## 为什么是这个项目

选它，不是因为它有趣，是因为它刚好含有**三件你以后一定会遇到的事**：

1. **有时间。** 只要程序里有"过一会儿"这件事，就会有定时器、有节流、有误差。这是所有新手第一次撞墙的地方。
2. **有状态。** 运行中、暂停、归零、完成——四个状态互相转换。状态一多，就一定会漏掉某个转换，就一定会出 bug。
3. **有持久化。** 数据要存进浏览器，存的方式决定了刷新后它是活着还是死了。

这三个词——**定时、状态、存储**——你之后做的每一个项目里都会有。现在花两小时把它们看透，比做十个"能跑就行"的页面值。

::: tip 时间预算
- 读这一章：40 分钟
- 自己动手做一遍：1.5 – 2 小时
- 只读不做：一小时能读完，但你什么都没学到

**建议边读边做。** 每读完一节，就在自己的文件夹里把那一节做完，再往下。
:::

## 开始之前

你需要：

- VS Code 装好，能打开文件夹（[第 0 章](/start/vscode/)）
- 一个编程 Agent 能在终端或编辑器里跑起来（[选 Agent](/start/agent/)）
- Git 初始化好了，至少提交过一次（[Git](/start/git/)）

在桌面上建一个文件夹，就叫 `pomodoro`，用 VS Code 打开它，然后在终端里：

```bash
git init
```

做完这一步，往下走。

::: tip 下一步
第一件事永远是同一件：[写需求卡](/case-timer/requirement/)。
:::
