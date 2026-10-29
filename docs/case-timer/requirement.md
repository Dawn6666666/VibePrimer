---
title: 第一步：把它问清楚
icon: carbon:chat
permalink: /case-timer/requirement/
createTime: 2026/10/28 09:54:13
---

“帮我做一个番茄钟”足以让 Agent 瞬间生成几百行代码，但通常伴随着各种多余设计：未经同意加了倒计时音效、弹窗通知、复杂的设置面板，或者刷新后状态错乱。

在五步循环中，**第一步永远是「想清楚」**：先不要让 Agent 碰代码，而是通过一次结构化短访谈，把所有会影响实现的分支与约束彻底锁死，然后落盘为一份清晰的 `REQUIREMENT.md` 并执行第一次 Git 提交。

## 让 Agent 先提问

在已打开的 `pomodoro` 项目中，向 Agent 发送以下访谈提示词：

```text title="结构化访谈提示词"
我要做一个本地番茄钟网页，双击就能打开。
先不要写代码。最多问我 10 个会影响实现的问题，一次列完。
不要问配色和字体，问题按重要性排序。
```

下面是真实实操中，VS Code + Pi Agent 进行结构化访谈的完整对话与确定性回答：

<PiChat />

## 需求卡的五个结构要素

写给 Agent 的需求文档不需要长篇大论，但必须包含以下五个字段：

:::: field-group

::: field scene
@type string
@required
**使用者与运行环境**。明确单文件运行、双击 `file://` 打开、无网络环境。
:::

::: field io
@type string
@required
**输入与输出**。用户可点击的按钮（主按钮、重置按钮），页面呈现的内容（大号时间、今日完成数、网页标题）。
:::

::: field rules
@type string[]
@required
**核心状态机与流转规则**。明确 idle、running、paused、finished 四态及相互切换条件。
:::

::: field constraints
@type string[]
@required
**技术约束与降级要求**。单文件内联、零外部依赖、响应式无滚动条、localStorage 容错。
:::

::: field out-of-scope
@type string[]
@required
**排除清单（本版不做）**。明确拒绝音频、通知、设置页、休息倒计时、任务列表与图表。
:::

::::

## 需求落盘：真实的 REQUIREMENT.md

根据上面的问答，Agent 在项目根目录生成了最简需求卡 [REQUIREMENT.md](file:///home/yoake/Code/pomodoro/REQUIREMENT.md)（仅 44 行，干净克制）：

```markdown title="REQUIREMENT.md"
# 番茄钟 Demo 需求（最简版）

教学演示用，拒绝过度设计。单文件 `index.html`，内联全部 CSS 与 JS，双击用 `file://` 直接打开即可使用，不依赖网络、构建或本地服务器。

## 范围

固定 25 分钟倒计时，无设置页，无休息倒计时，无音频，无桌面通知，无任务列表，无图表。

## 输入

| 操作 | 说明 |
| --- | --- |
| 点主按钮 | 25:00 静止时开始倒计时；计时中暂停；暂停后继续 |
| 点重置按钮 | 任意时刻回到 25:00 并停止计时 |
| 刷新页面 | 回到 25:00 静止态（不恢复进行中的计时） |

## 输出

- 大号时间：`25:00` 起，每秒递减，到 `00:00` 停住不再继续。
- 主按钮文案：`开始` / `暂停` / `继续`，与当前状态一致。
- 重置按钮：始终可用。
- 当前阶段：专注中 / 已结束（仅用于控制按钮与标题，不新增界面元素）。
- 今日完成数：计数文本显示在页面上，完成一次 +1。

## 状态

`idle`（25:00 静止）→ `running`（递减中）⇄ `paused`（暂停）→ `finished`（停在 00:00）。

- `idle` 点开始 → `running`。
- 主按钮点击 `idle` 变为 `开始`，`running` 变为 `暂停`，`paused` 变为 `继续`。
- `running` 或 `paused` 点重置 → `idle`。
- `running` 归零 → `finished`，网页标题改为「休息一下」，今日完成数 +1。
- `finished` 点重置 → `idle`，标题恢复，可再次计时。

## 数据

localStorage 仅存今日完成数（含日期），跨天自动归零；刷新页面不清除。计时进度不持久化。

## 验收标准

1. 双击 `index.html` 直接打开可用：无控制台报错、无外部请求，页面只包含大号时间、主按钮、重置按钮三项核心元素。
2. 点开始后时间从 25:00 逐秒递减到 00:00 并停住；期间按钮在 开始/暂停/继续 之间正确切换，重置任意时刻回到 25:00 且计时停止。
3. 归零时网页标题变为「休息一下」且今日完成数 +1；刷新页面回到 25:00 静止、标题恢复，同一天内完成数保留。
```

## 状态机流转图

用 Mermaid 把这四种状态画出来，逻辑一目了然：

```mermaid
stateDiagram-v2
    [*] --> idle: 页面载入 / 重置
    idle --> running: 点「开始」
    running --> paused: 点「暂停」
    paused --> running: 点「继续」
    running --> finished: 倒计时归零 (00:00)
    running --> idle: 点「重置」
    paused --> idle: 点「重置」
    finished --> idle: 点「重置」
```

## 立即执行根提交（打下确定基线）

需求卡落盘后，不要急着写代码！让 Agent 在终端里直接执行 Git 提交，锁死这份共识：

:::: tabs

@tab 用户指令

```text title="提交提示词"
这份 REQUIREMENT.md 很好。
请调用终端命令，把 REQUIREMENT.md 暂存并提交，提交信息为 "docs: 建立番茄钟最简需求卡"。
```

@tab Agent 工具调用

```bash title="终端执行输出"
💻 [Bash]:
$ cd /home/yoake/Code/pomodoro && git add REQUIREMENT.md && git commit -m "docs: 建立番茄钟最简需求卡"

📋 [Result]:
[main（根提交） e629d7c] docs: 建立番茄钟最简需求卡
 1 file changed, 43 insertions(+)
 create mode 100644 REQUIREMENT.md
```

::::

::: tip 为什么需求也要进 Git
需求卡是后续所有代码 diff 的唯一法理裁判。如果需求随口变动而不落盘提交，后续出现 bug 时你就无法分清是「Agent 写错了」还是「你记错了需求」。进仓库就是签合同。
:::

需求卡已锁定，下一步进入计划阶段：

[下一步：让 Agent 先交方案](/case-timer/prompt/){.read-more}
