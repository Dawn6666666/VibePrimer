---
title: 三个 bug 和一个边界检查
icon: carbon:debug
permalink: /case-timer/bug/
createTime: 2026/10/28 10:01:41
---

下面按“复现、提出假设、修改、复测”的顺序处理三个主要问题，最后检查归零边界。代码以本篇的简化错误版为例；如果你的变量名不同，先读懂对应职责，不要只复制片段。

## Bug 1：重复开始导致加速

### 复现与提问

```text
操作：打开页面 → 开始 → 再点一次开始
期望：已经运行时不会创建第二个计时器
实际：剩余时间每秒约减少 2
频率：每次都出现
```

把“有点快”改成上面的报告，再补充你的假设：

```text
我猜测每次点击都新建了 setInterval，timerId 只保留最后一个。
先不要改代码。说明怎样验证这个假设，再给出同时覆盖开始、暂停、继续和重置的最小修改。
```

如果在 `setInterval` 赋值之后记录 `timerId`，连续点击会看到不同的定时器句柄。把日志放在赋值之前，只能看到旧值。

### 修复

`running` 用来判断程序是否运行，`timerId` 只是定时器句柄，按钮文字由状态更新。主按钮和重置可以写成：

```js
let running = false

function start() {
  if (running) return
  running = true
  timerId = setInterval(() => {
    remain--
    render()
  }, 1000)
  toggle.textContent = '暂停'
}

function pause() {
  if (!running) return
  running = false
  clearInterval(timerId)
  timerId = null
  toggle.textContent = '继续'
}

toggle.addEventListener('click', () => {
  if (running) pause()
  else start()
})

reset.addEventListener('click', () => {
  running = false
  clearInterval(timerId)
  timerId = null
  remain = 25 * 60
  toggle.textContent = '开始'
  render()
})
```

这段代码仍会使用后面要替换的每秒减 1 逻辑。当前只验收状态切换和重复点击，确认没有多个定时器后再进入下一项。

## Bug 2：后台标签页里计时落后

### 复现

```text
操作：开始 → 切到另一个标签页 → 等待 30 秒 → 返回
期望：剩余时间约减少 30 秒
实际：在某些浏览器或系统状态下，减少得更少
```

后台节流程度取决于浏览器、系统和标签页状态，30 秒不一定在每个环境里都能复现。可以适当延长测试时间，并以秒表记录的真实经过时间为依据。

### 原因与修复

`remain--` 把一次回调当成一秒。后台标签页减少回调次数后，倒计时就会被拖长。改成记录目标结束时间，每次回调根据当前时间重算：

```js
let endAt = 0

function update() {
  remain = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
  if (remain === 0) return finish()
  render()
}

function start() {
  if (running) return
  if (remain === 0) remain = 25 * 60
  running = true
  endAt = Date.now() + remain * 1000
  toggle.textContent = '暂停'
  timerId = setInterval(update, 250)
  update()
}

function pause() {
  if (!running) return
  remain = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
  if (remain === 0) return finish()
  running = false
  clearInterval(timerId)
  timerId = null
  toggle.textContent = '继续'
  render()
}

function finish() {
  running = false
  clearInterval(timerId)
  timerId = null
  remain = 0
  render()
  document.title = '休息一下'
  toggle.textContent = '开始'
}
```

`Math.ceil` 表示这一秒还没过完就仍显示 1，避免提前约半秒显示零。后台回调仍可能变慢，但回到页面后会按真实时间重算；手动修改系统时钟则是另一项限制。

## Bug 3：第二次完成变成 11，日期也没有生效

先看一种常见的存储写法：

```js
let done = localStorage.getItem('pomo-done') || 0
countEl.textContent = done

// 在 finish() 里：
done += 1
localStorage.setItem('pomo-done', done)
countEl.textContent = done
```

第一次完成时，`done` 可能是数字 0，加 1 得到数字 1。写入后，存储值会变成字符串 `"1"`。刷新后读出的也是字符串，再执行 `done += 1` 就会拼接成 `"11"`。刷新后显示 1 本身说明读取成功，问题发生在下一次加法。

`localStorage.setItem('pomo-done', 1)` 并没有错，写入时数字会自动转成字符串。真正缺的是读取后的类型转换、数据校验和日期处理。

### 按日期保存对象

```js
const KEY = 'pomo-today-v1'

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
    // 存储不可用或数据损坏时使用默认值
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
```

然后在 `finish()` 更新计数：

```js
if (today() !== currentDate) {
  currentDate = today()
  done = 0
}
done += 1
saveToday()
countEl.textContent = done
```

对象存储才需要 `JSON.stringify` 和 `JSON.parse`。只存一个数字时也可以直接存字符串，但读取后仍要转换并校验。

## 边界检查：不要只遮住负数

每秒减 1 的错误版在零以后可能显示 `-1:-1`。只写 `remain = Math.max(0, remain)` 会把负数遮住，却不会停止定时器，也不能保证完成数只加一次。

完整的归零处理要同时做到：剩余时间不小于 0、清除定时器、只进入一个 `finish()`、更新标题和按钮。前面的 `update()` 与 `finish()` 已经一起处理了这些情况。

## 修复后的对照

| 改动 | 解决的问题 |
| --- | --- |
| `running` 与统一的开始、暂停、重置 | 重复定时器和按钮状态不一致 |
| `endAt` 与 `Date.now()` 差值 | 后台节流导致倒计时被拖长 |
| `Math.ceil`、`Math.max` 和 `finish()` | 提前显示零、负数和归零后仍运行 |
| 日期加计数的存储对象 | 字符串拼接、无效数据和跨天计数 |

完成版见 [案例首页](/case-timer/)。逐项对照代码职责，不必要求变量名和排版完全相同。

在 `BUGS.md` 记录实际原因和复测结果：

```markdown
- 重复开始加速：每次点击新建定时器；加入 running 判断后复测通过。
- 后台计时落后：把回调次数当秒数；改为目标结束时间差值后复测通过。
- 第二次完成变 11：读取后未转数字；增加类型校验和日期对象后复测通过。
- 负数与重复归零：统一 update 和 finish 的边界处理后复测通过。
```

[下一步：交付](/case-timer/finish/){.read-more}
