---
title: 写测试：让命令替你把关
icon: carbon:task
permalink: /craft/test/
createTime: 2026/10/28 10:00:15
---

AI 说"完美解决了"的时候，你要的不是它的自信，是**一个能重复运行的判断**。

测试就是这个判断。它是一句写下来的"我期望这样"，机器每次都能替你验一遍。

## 最小的测试长什么样

不用框架，不用 `npm install`，一个文件就够：

```js
// format.js
export function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}
```

```js
// format.test.js
import assert from 'node:assert/strict'
import { formatTime } from './format.js'

assert.equal(formatTime(1500), '25:00')
assert.equal(formatTime(0), '00:00')
assert.equal(formatTime(59), '00:59')
assert.equal(formatTime(60), '01:00')
assert.equal(formatTime(-1), '00:00')   // 边界：负数不该出现 -0:01

console.log('全部通过')
```

跑：

```bash
node format.test.js
```

有输出「全部通过」就是过了；没通过会直接抛错，告诉你哪一行期望什么、实际什么。

::: tip 一个副产品
为了能测，你会自然地把纯逻辑从 `index.html` 里拆到 `format.js`。

这个动作叫**重构**，它不是为了测试才做的——但测试会逼你做对。逻辑一旦能单独运行，你就能单独理解它。
:::

## 三条测试，每个功能都该有

| 类型 | 例子 | 为什么 |
| --- | --- | --- |
| 正常 | `formatTime(1500) === '25:00'` | 证明主路径是通的 |
| 空 / 零 | `formatTime(0) === '00:00'` | 归零、空数组、空输入，最容易崩 |
| 边界 | 负数、超长、重复、小数 | 真实世界会喂给你这些 |

## 让它先写测试，再写实现

这个顺序很重要，用起来是这样的：

```text
我们要实现 formatTime(seconds)，把秒数转成 "MM:SS"。

第一步：先写 6 个测试用例，放在 format.test.js 里，
覆盖：正常值、0、59 秒、60 秒、负数、非整数。
先运行给我看它们是失败的。

第二步：我确认测试合理之后，你再实现 format.js，
反复运行 node format.test.js，直到全部通过，
把最后一次运行的完整输出贴给我。
```

为什么要"先失败"：

- 你能确认这个测试**真的在测东西**（一个永远通过的测试等于没有）
- 你能确认测试的期望是你想要的，而不是它猜的
- 它没法偷偷改测试来"通过"

## 前端怎么测

界面不好自动测，但你 80% 的 bug 都在逻辑里。所以：

**一、把逻辑抽成纯函数。** 上面的 `formatTime` 就是例子。计时逻辑里的"还剩多少秒"也是一个纯函数：

```js
export function remainingSeconds(endAt, now) {
  return Math.max(0, Math.round((endAt - now) / 1000))
}
```

能测它，你就不用真的等 25 分钟。

**二、界面用手动清单。** 就是 [交付](/loop/ship/) 里那张边界表。手动清单不是落后的做法，它是你的眼睛。

## 让它自己跑测试

如果项目里有测试命令，把它写进 `AGENTS.md`：

```markdown
## 完成标准
每次改动后，必须：
1. 运行 `node format.test.js`，全部通过
2. 运行 `node --check script.js`，没有语法错误
把命令输出贴出来。不要只说「已完成」。
```

然后你就可以说一句很爽的话：

```text
做完之后自己跑测试，把输出贴给我。不通过就继续改，直到通过。
```

这就是"机器门禁"：能被命令验证的事，不靠它自我感觉。

## 什么时候不写测试

别走火入魔。这些情况可以不写：

- 一次性的、交完就扔的作业
- 纯展示页面（一个静态介绍页）
- 你还没跑通第一版的时候——先让它能跑，再补测试

判断标准很简单：**这个功能如果坏了，你会不会很难受？** 会，就写一条。

## 一句话

::: tip 测试不是给老师看的
是给三周后的你看的。那时候你已经忘了所有细节，只有那几条 assert 还记得"这里应该是什么样"。
:::

::: tip 下一步
写代码时最大的风险不是 bug，是[安全](/craft/safety/)——有些坑踩一次就够了。
:::
