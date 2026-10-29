---
title: 写测试：让命令重复检查
icon: carbon:task
permalink: /craft/test/
createTime: 2026/10/28 10:00:15
---

测试把预期行为写成可以重复运行的判断。它能检查已覆盖的输入，不能证明程序完全没有 bug，但能减少同一问题反复出现。

## 一个可直接运行的例子

下面使用两个 `.mjs` 文件。`.mjs` 明确表示 ES 模块，不需要额外配置 `package.json`。

```js title="format.mjs"
export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError('seconds 必须是有限数字')
  const whole = Math.max(0, Math.floor(seconds))
  const m = String(Math.floor(whole / 60)).padStart(2, '0')
  const s = String(whole % 60).padStart(2, '0')
  return `${m}:${s}`
}
```

```js title="format.test.mjs"
import assert from 'node:assert/strict'
import { formatTime } from './format.mjs'

assert.equal(formatTime(1500), '25:00')
assert.equal(formatTime(0), '00:00')
assert.equal(formatTime(59), '00:59')
assert.equal(formatTime(60), '01:00')
assert.equal(formatTime(-1), '00:00')
assert.equal(formatTime(59.9), '00:59')
assert.throws(() => formatTime(NaN), TypeError)

console.log('7 条测试全部通过')
```

把两个文件放在同一目录，运行：

```bash title="运行测试"
node format.test.mjs
```

成功时会输出 `7 条测试全部通过`。失败时 Node 会显示断言位置、期望值和实际值。这里的规则是：负数钳制为 0，小数向下取整，非有限数字抛错。不同项目可以选择不同规则，但实现和测试必须一致。

这个例子是独立的 Node 测试，不要求你改造前面的单文件案例。若要让浏览器复用 `.mjs`，应通过本地 HTTP 服务和 `type="module"` 加载，不要直接在 `file://` 页面里假定模块一定可用。

## 每类功能先考虑三种输入

| 类型 | 例子 | 作用 |
| --- | --- | --- |
| 正常值 | `formatTime(1500)` | 检查主要行为 |
| 零或空值 | `formatTime(0)`、空数组 | 检查初始和空状态 |
| 边界与非法值 | 负数、小数、`NaN`、超长输入 | 明确取舍和容错规则 |

测试数量不是目标。应优先覆盖容易出错、出错代价高、以后可能重复修改的逻辑。

## 先写测试时注意失败原因

可以让 Agent 先写测试和占位实现：

```text title="测试先行提示词"
实现 formatTime(seconds)，规则是负数归零、小数向下取整、非有限数字抛 TypeError。
先写 format.test.mjs 和会抛出「尚未实现」的 format.mjs 占位导出。
运行一次，确认失败来自预期断言，而不是找不到模块或语法错误。
等我确认测试合理后再实现。不要修改测试来掩盖实现错误。
```

一个永远通过的测试可能没有真正执行断言。首次失败能帮助你检查测试是否生效，但“找不到模块”不算有效失败。Agent 仍可能改测试，所以要看测试 diff，并由你独立重跑。

测试先行适合规则清楚的函数。探索页面原型时，也可以先让主路径跑起来，再补自动化测试；两种方式都要保留人工验收。

## 前端逻辑和界面分别检查

纯函数不直接读写页面、网络或存储，同样输入总会得到同样输出，最适合用 Node 断言检查。例如剩余时间计算：

```js title="剩余时间计算纯函数"
export function remainingSeconds(endAt, now) {
  return Math.max(0, Math.ceil((endAt - now) / 1000))
}
```

可以补充这些用例：还剩 1500 毫秒返回 1，已经超时返回 0，恰好到结束时间返回 0。`Math.ceil` 能避免这一秒未结束就提前显示零，应与番茄钟实现保持一致。

按钮是否可见、窄屏是否重叠、读屏顺序等界面行为仍需要手动清单或浏览器测试。自动化测试和人工验收各自覆盖不同风险。

## 把测试命令写进项目规则

```markdown title="AGENTS.md 测试约定示例"
## 完成标准
- 运行 node format.test.mjs，全部通过
- 对普通脚本运行 node --check script.js，无语法错误
- 在交付说明中列出实际运行的命令和未覆盖的界面测试
```

Agent 可以运行这些命令，但你要查看真实输出，必要时自己再跑一次。不要只接受“已修复”的文字结论。

一次性静态页面可以不写自动化测试，但仍要手动检查链接和显示。核心逻辑会长期使用或出错代价较高时，值得至少保留几条关键测试。
