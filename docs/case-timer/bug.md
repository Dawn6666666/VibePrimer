---
title: 三个 bug
icon: carbon:debug
permalink: /case-timer/bug/
createTime: 2026/10/28 10:01:41
---

这一节是全篇最像真实开发的部分。

上一节那个版本"能跑"。能跑的意思是：你点一下，数字会动。它离"能信"还差三个 bug——而且这三个 bug 的共同点是：**不试就发现不了。**

## Bug 1：点两次开始，时间跑两倍

### 复现

```text
操作：点「开始」→ 再点一次「开始」
期望：没有任何变化（已经在跑了）
实际：数字每秒减 2
频率：每次都能复现
```

### 我的第一个错误报告

我一开始是这么问的：

> 点了开始之后时间走得有点快

它回了三句"可能是浏览器性能问题""建议检查设备时间"——**全是废话**。

因为"有点快"不是信息。它没有复现步骤，没法定位。

### 改成这样

```text
bug：点两次「开始」，倒计时速度变成两倍。

复现：打开页面 → 点开始 → 立即再点一次开始 → 数字每秒减 2。
期望：第二次点击不应该产生任何影响。
频率：每次都这样。

我的猜测：每点一次就新建了一个 setInterval，
但 timerId 只保存了最后一个，前面的清不掉。

先不要改代码。告诉我最可能的原因，以及怎么验证。
```

### 它的诊断

::: chat title="诊断"

{Claude}

你猜对了。

`#start` 的点击回调里直接 `setInterval(...)`，没有检查是否已经有定时器在跑。第二次点击创建了第二个 interval，两个都在减 `seconds`，所以是每秒减 2。而且 `timerId` 被第二次赋值覆盖了，第一个 interval 的 id 丢了，你再也 clear 不到它。

验证方法：在回调开头加 `console.log('tick created', timerId)`，连点两次，你会在控制台看到同一个按钮创建了两次定时器。

{}

修吧。但别只加一个 if 判断，把状态理清楚。

:::

### 修复的关键：状态只有一个来源

最省事的修法是加个 `if (timerId) return`。能治好症状，但治不了病——因为程序里同时有 `timerId`、按钮文字、`seconds` 三份"我现在在不在跑"的信息，它们随时可以不一致。

改成一个明确的 `running`：

```diff
- document.querySelector('#start').addEventListener('click', () => {
-   timerId = setInterval(() => {
-     seconds--
-     render()
-   }, 1000)
- })
+ let running = false
+
+ function start() {
+   if (running) return          // 已经在跑，什么都不做
+   running = true
+   timerId = setInterval(() => {
+     seconds--
+     render()
+   }, 1000)
+   toggle.textContent = '暂停'
+ }
```

一次点击只会改变一个状态，界面跟着状态走。

::: tip 这个 bug 教会的事
**"重复点击"是所有按钮的必测项。** 现在把它写进你的验收标准，以后每个有按钮的项目都用得上。

顺便记住：报 bug 的时候，"有点快"这种描述的价值是零。**步骤 + 期望 + 实际 + 频率**，四句话，缺一不可。
:::

## Bug 2：切到别的标签页，回来发现少走了半分钟

### 复现

```text
操作：点开始 → 切到浏览器另一个标签页 → 等 30 秒 → 切回来
期望：正好走了 30 秒
实际：只走了 10 秒左右（有时候更少）
频率：切得越久，差值越大
```

### 为什么

浏览器会给后台标签页**降频**：为了省电，`setInterval` 从每秒一次变成几秒一次。你的代码假设"每次回调 = 过去了一秒"，这个假设在后台崩溃了。

这不是浏览器的 bug，是设计如此。

### 修法：不要数秒，要算时间

```diff
- timerId = setInterval(() => {
-   seconds--
-   render()
- }, 1000)
+ endAt = Date.now() + seconds * 1000
+ timerId = setInterval(() => {
+   seconds = Math.max(0, Math.round((endAt - Date.now()) / 1000))
+   if (seconds === 0) return finish()
+   render()
+ }, 250)
```

思路变了：**开始时记一个"结束时刻"，之后每次只是问"现在离结束还有多久"。**

定时器被降频，只是刷新得不那么勤，算出来的数字仍然准。就算它一分钟才被叫醒一次，数字一样对。

::: warning 这类 bug 的可怕之处
它不会报错。你不在后台待过，就永远发现不了。

而用户会——他们会切去背单词，回来发现番茄钟短了两分钟，然后觉得"这破东西不准"，再也不用。

**所有"和时间有关"的功能，都要问一句：如果程序被打断了，它还能算对吗？**
:::

## Bug 3：刷新一下，今天的记录没了

### 复现

```text
操作：完成一个番茄（把常量改成 5 秒来测）→ 今日显示 1 → 刷新页面
期望：今日还是 1
实际：变回 0
```

需求卡里明明写了这条，但它没做——**因为你验证的时候没试**。这就是为什么验收标准要一条条手上过。

### 它第一版给的代码

```js
localStorage.setItem('done', done)      // 存
let done = localStorage.getItem('done') // 读
```

两行都有问题。

**存的问题**：`localStorage` 只能存字符串。存数字会被转成字符串，读回来是 `"1"`，再 `+1` 变成 `"11"`（字符串拼接），点到第九个番茄，你会看到 `"111111111"`。

**读的问题**：第一次打开时 `getItem` 返回 `null`，`null + 1` 是 `1`——看起来没事，但一旦进入字符串分支就会连环出错。

### 修法：存的时候序列化，读的时候兜底

```js
const KEY = 'pomo-done'

function loadDone() {
  try {
    const raw = localStorage.getItem(KEY)
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0            // 隐私模式 / 存储被禁用
  }
}

function saveDone(n) {
  try {
    localStorage.setItem(KEY, String(n))
  } catch {
    // 存不进去就算了，不要让整个页面崩掉
  }
}
```

三件事：**转成数字再算、读不到给默认值、写失败不要崩**。

如果你要存的是对象（比如整个设置），就是 `JSON.stringify` / `JSON.parse`，同样要 `try/catch` 兜底——因为用户可能在新版本里读到旧格式的数据。

## Bug 4（附赠）：跑到负数

```text
让它一直跑到 0 以下：显示 -1:-1
```

`Math.floor(-1 / 60)` 是 `-1`，`-1 % 60` 是 `-1`，拼出来就是 `-1:-1`。

一行修完：

```js
seconds = Math.max(0, seconds)
```

这个不算 bug，算"没想过"。而"没想过"占新手 bug 的一大半。

## 修完的样子

四个问题都修完之后，就是你在 [案例首页](/case-timer/) 玩过的那个版本。它多出来的东西其实很少：

| 改动 | 作用 |
| --- | --- |
| `endAt` 时间戳 | 后台节流不影响准确度 |
| `running` 布尔值 | 一个状态来源，点两次不会开两个定时器 |
| `Math.max(0, ...)` | 永远不出现负数 |
| `loadDone` / `saveDone` | 刷新不丢，读不到有兜底 |
| `finish()` 独立出来 | 归零这件事只有一个入口 |

**代码没有变长多少，但每一行你都能解释了。**

## 记录一下

在 `BUGS.md` 里写四行：

```markdown
- 点两次开始变两倍速 → 每次点击都新建 interval，没有 running 守卫
- 后台标签页计时变慢 → 用 endAt 时间戳差值，不用累加
- 刷新丢数据 → localStorage 只存字符串，读不到要给默认值
- 显示 -1:-1 → 负数取模，Math.max(0, x) 兜住
```

这就是你的错误模式清单的第一页。以后每抓一个 bug，加一行。

::: tip 下一步
修好了，能信了。最后一件事：[交付](/case-timer/finish/)。
:::
