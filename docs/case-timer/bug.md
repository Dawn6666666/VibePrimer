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

判断程序运行不能只靠定时器变量是否存在。主按钮和重置逻辑的修改对比如下：

::: tabs#bug-repeat

@tab 修复前（无状态守卫）#before

```javascript title="app.js"
function start() {
  // 连续点击会重复创建定时器，导致倒计时成倍加速
  timerId = setInterval(() => {
    remain--
    render()
  }, 1000)
  toggle.textContent = '暂停'
}
```

@tab 修复后（增加 running 状态锁）#after

```javascript ins={2,4} title="app.js"
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

:::

这段代码仍保留了简单的递减逻辑。先验收状态切换和重复点击，确认连续点击不会加速后，再解决后台标签页变慢的问题。

## Bug 2：后台标签页里计时落后

### 复现

```text
操作：开始 → 切到另一个标签页 → 等待 30 秒 → 返回
期望：剩余时间约减少 30 秒
实际：在部分浏览器或系统休眠策略下，减少的秒数明显少于 30 秒
```

后台节流程度取决于系统和浏览器对非活动标签页的调度。30 秒不一定在所有机器上都能复现，可以把测试时间延长到 60 秒，并对照手机秒表核验。

### 原因与修复

浏览器退到后台后，为了省电会降低定时器执行频次。如果把每次回调都等同于经过了一秒，倒计时就会滞后。修复方式是记录预期的结束时间戳，每次回调时用当前时间重算差值。

::: tabs#timer-fix

@tab 简单递减（有缺陷）#decrement

```javascript title="app.js - 每秒递减"
function update() {
  remain--
  if (remain <= 0) return finish()
  render()
}
```

@tab 时间戳差值（修复后）#timestamp

```javascript ins={4-6} del={2} title="app.js - 基于绝对时间差"
function update() {
  // 不再盲目假定回调间隔严格等于一秒
  // remain--
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

:::

::: tip 自测思考
如果用户在倒计时期间点击了暂停，等待 20 秒后再点击继续，为什么不能直接沿用旧的 `endAt`？

答案：:spoiler[因为旧的 endAt 是基于暂停前的时间算出来的，如果直接沿用，暂停期间流逝的 20 秒也会被算进倒计时，导致继续后时间突然跳水。继续时必须重新根据当前 remain 重新计算 endAt。]
:::

## Bug 3：第二次完成变成 11，日期也没有生效

常见的错误写法是直接拿 `localStorage.getItem` 的返回值做数字加法：

::: tabs#storage-bug

@tab 拼接缺陷（字符串相加）#naive

```javascript title="有隐患的直接存取"
let done = localStorage.getItem('pomo-done') || 0
countEl.textContent = done

// 在 finish() 里：
done += 1 // 第一次读取若为 "1"，在此处拼接变成 "11"
localStorage.setItem('pomo-done', done)
countEl.textContent = done
```

@tab 规范写法（类型校验与日期对象）#safe

```javascript title="按日期持久化对象"
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
```

:::

第一次完成时，`done` 是数字 0，加 1 得到数字 1。写入时数字会自动转为字符串 `"1"`。刷新页面后再读出来是字符串，直接执行 `done += 1` 就会按字符串拼接成 `"11"`。

所以存取时需要使用 `JSON.stringify` 和 `JSON.parse`，读取后要校验日期匹配和数据类型。

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
