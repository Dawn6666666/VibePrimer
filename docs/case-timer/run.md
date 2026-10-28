---
title: 让它跑起来
icon: carbon:play-filled
permalink: /case-timer/run/
createTime: 2026/10/28 10:01:16
---

计划在 TODO.md 里躺着，现在一条一条做。

**每一条都走同一个节奏：下指令 → 看 diff → 跑 → 提交。**

## 第 1 条：骨架

```text
做 TODO 第 1 条：一个 index.html，居中显示 25:00，
下面两个按钮「开始」「重置」，样式写在 <style> 里。
按钮暂时不需要任何功能。
```

它给你的大概是二十行 HTML 加十几行 CSS。这里没什么可说的，**唯一的动作是打开看**：

- 数字是居中的吗
- 字号够大吗（倒计时看着要能一眼读出）
- 两个按钮在同一行吗

不满意就当场说，别憋着："数字再大一点，80px；按钮间距 12px。" 这类调整让它改十次也不费劲。

改完提交：

```bash
git add .
git commit -m "骨架：显示 25:00 和两个按钮"
```

## 第 2 条：让它动起来

```text
做第 2 条和第 3 条：点「开始」后数字每秒减 1，按钮文字变成「暂停」，
再点变成「继续」并从暂停处接着走。点「重置」回到 25:00。
只改 index.html。不要加别的功能。
```

它给你一版能跑的。**先别满意，先点几下试试。**

这一版大概长这样。你可以在下面这个沙盒里直接玩——注意，**它是故意有 bug 的**：

:::: demo title="第一版 · 能跑，但有问题" desc="点「开始」，数字开始走。然后再点一次「开始」。"
```html
<div class="pomo">
  <div id="clock">25:00</div>
  <div class="btns">
    <button id="start">开始</button>
    <button id="reset">重置</button>
  </div>
</div>
<style>
  body {
    margin: 0;
    min-height: 240px;
    display: grid;
    place-items: center;
    font-family: system-ui, sans-serif;
    background: #0f1115;
    color: #e8ecf3;
  }
  #clock {
    font-size: 56px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 1px;
  }
  .btns { display: flex; gap: 10px; justify-content: center; margin-top: 16px; }
  button {
    padding: 9px 20px;
    font-size: 15px;
    border-radius: 8px;
    border: 1px solid #2b3140;
    background: #1a1f2b;
    color: #e8ecf3;
    cursor: pointer;
  }
</style>
<script>
  const clock = document.querySelector('#clock')
  let seconds = 25 * 60
  let timerId = null

  function render() {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    clock.textContent = m + ':' + s
  }

  document.querySelector('#start').addEventListener('click', () => {
    timerId = setInterval(() => {
      seconds--
      render()
    }, 1000)
  })

  document.querySelector('#reset').addEventListener('click', () => {
    seconds = 25 * 60
    render()
  })

  render()
</script>
```

::::

玩出什么了吗？

- 点两次「开始」，数字**跑得比一秒快**——因为开了两个 `setInterval`
- 没有暂停，按钮文字也不会变
- 点「重置」之后，倒计时**还在继续跑**
- 让它跑到负数，会显示 `-1:-1` 这种鬼东西

四条问题。第一条最隐蔽，因为你只有在"手快"的时候才会发现它。

**这就是为什么验收标准里那条"重复点开始不会加速"值钱。** 你在需求卡里写下了它，所以现在你会去试它。

## 看 diff：它到底改了什么

在提交之前，`Ctrl+Shift+G` 点开改动。你只看三件事：

| 看什么 | 这一版的情况 | 判断 |
| --- | --- | --- |
| 改了几个文件 | 只有 `index.html` | 合格 |
| 加了多少行 | `+38 −2` | 合格，能读懂 |
| 有没有顺手加别的 | 没有引入依赖，没改类名 | 合格 |

如果它这时候给你加了"深色模式按钮"或"完成音效"，直接说：

```text
需求里没有这个，删掉，只保留计时逻辑。
```

## 读代码：只看三处

七十行里，你只需要真的看懂三个地方。

**一、状态在哪**

```js
let seconds = 25 * 60   // 剩余秒数
let timerId = null      // 定时器的 id，用来清掉它
```

这两个变量就是这个程序全部的"记忆"。屏幕上的 `24:59` 是从 `seconds` 渲染出来的，不是字符串在变。**理解这一点，你就理解了所有界面程序。**

**二、渲染在哪**

```js
function render() {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  clock.textContent = m + ':' + s
}
```

`Math.floor(seconds / 60)` 是分钟，`seconds % 60` 是秒，`padStart(2, '0')` 补零。`render()` 只做一件事：**把 state 变成屏幕上的字**。

以后所有"数字显示不对"的问题，都从这行往下查。

**三、时间从哪来**

```js
setInterval(() => {
  seconds--
  render()
}, 1000)
```

每 1000 毫秒执行一次，`seconds` 减一，然后重画。

这一行是**所有 bug 的源头**：浏览器不保证 1000 毫秒准时；你切到别的标签页，它会被降频；你点两次，就有两个定时器在同时减。后面三个 bug，全在这一行附近。

## 提交

```bash
git add .
git commit -m "计时逻辑：开始/重置"
```

到这里，「生成并运行」这一步就算走完了：**你亲眼看见数字在跳，而且你知道它跳得不对。**

下一步是把它修对。

::: tip 下一步
[三个 bug](/case-timer/bug/) —— 从"能跑"到"能信"，全在这一步。
:::
