---
title: 第三步：生成并运行
icon: carbon:play-filled
permalink: /case-timer/run/
createTime: 2026/10/28 10:01:16
---

计划拆解完成后，进入分步实现环节。原则是每次只派发一个任务，完成后审查 diff 并验证，确认无误再继续下一项。

本节我们将实际跑通前两项任务：任务一（静态骨架）与任务二（倒计时与状态机）。

## 任务一：骨架搭建与静态样式

### 1. 派发单任务指令

严格限制 Agent 的活动范围，禁止越界写逻辑：

```text title="任务一派发提示词"
严格只实现【任务一：骨架搭建与静态样式】：
- 创建 index.html，包含 HTML 骨架、极简居中排版和 tabular-nums 时间样式。
- 绝对不要写倒计时与 JavaScript 逻辑！只完成静态骨架。
- 完成后告诉我如何预览，等待我验收。
```

### 2. 审查生成的代码

Agent 生成了极简的单文件 `index.html`。我们在代码审查时重点核对三点：
1. **边界检查**：页面中 `<script>` 标签数量为 **0**，未包含多余的业务脚本。
2. **防抖排版**：时间文字加上了 `font-variant-numeric: tabular-nums`，确保等宽数字，后续秒数跳变时整体数字绝对不会左右抖动。
3. **响应式自适应**：字号使用 `clamp(72px, 18vw, 152px)`，窄屏和宽屏均能完美自适应。

### 3. 页面直测与效果预览

Agent 自动调用内置无头浏览器完成了首屏渲染截屏：

![任务一：纯静态骨架与防抖居中排版](/images/case-timer/task1-preview.png)

你也可以在本地终端中运行系统默认浏览器打开：

```bash title="在默认浏览器中打开"
xdg-open index.html   # Linux
open index.html       # macOS
start index.html      # Windows
```

确认控制台 0 报错、无外部网络请求、大字号 `25:00` 居中且双按钮就绪。

### 4. 提交任务一

验收通过后，让 Agent 提交任务一代码：

```bash title="任务一提交日志"
💻 [Bash]:
$ cd /home/yoake/Code/pomodoro && git add index.html && git commit -m "feat: 完成骨架搭建与静态样式"

📋 [Result]:
[main 17db13e] feat: 完成骨架搭建与静态样式
 1 file changed, 102 insertions(+)
 create mode 100644 index.html
```

---

## 任务二：核心倒计时与状态流转

### 1. 派发任务二指令

骨架已经就绪，现在让 Agent 添加核心状态机：

```text title="任务二派发提示词"
任务一验收通过，静态骨架和样式完全符合预期。

请执行【任务二：核心倒计时与状态流转】：
- 在 index.html 中加入内联 <script>。
- 严格按照 TODO.md 任务二实现：idle / running / paused / finished 四态状态机，主按钮与重置逻辑，归零停在 00:00 并修改网页标题。
- 先不要做 localStorage 持久化（那是任务三）。
- 实现完成后，在代码里保留 1 处易于临时把 1500 秒改成 3 秒的快速验证方式，并告诉我如何验收。
```

### 2. 状态机与防加速核心代码

Agent 在 `index.html` 底部引入了状态机脚本。请看两处关键的工程防呆设计：

:::: code-tabs

@tab 单定时器防抖防加速

```js
// 避免连击导致累加多个 setInterval 定时器（常见新手 bug：越点越快）
function startTicking() {
  clearInterval(intervalId); // 每次启动前强制清理旧定时器
  intervalId = setInterval(tick, 1000);
}

function stopTicking() {
  clearInterval(intervalId);
  intervalId = null;
}
```

@tab 快速测试开关

```js
// ── 快速验证开关 ───────────────────────────────────────────────
// 把下面这行的 25 * 60 改成 3，即可 3 秒走完一轮，用于验收归零表现。
// 验完务必改回 25 * 60。
const DURATION_SECONDS = 25 * 60;
// ──────────────────────────────────────────────────────────────
```

::::

### 3. 验收操作与自动化测试

Agent 使用自动化浏览器执行了点击测试矩阵，验证结果如下：

| 测试步骤 | 实际观测结果 | 结论 |
| --- | --- | --- |
| 初始加载 | `25:00` / 主按钮 `开始` / 网页标题 `番茄钟` | ✅ 正常 |
| 点「开始」走 1.2 秒 | 显示 `24:59` / 主按钮切换为 `暂停` | ✅ 正常 |
| 点「暂停」后等 1.5 秒 | 数字锁定在 `24:55` 不变 / 主按钮变为 `继续` | ✅ 正常 |
| 点「继续」走 1.1 秒 | 数字继续递减至 `24:54` / 主按钮变 `暂停` | ✅ 正常 |
| 连续点击「重置」3 次 | 稳定回到 `25:00`，不加速、无负数 | ✅ 防重生效 |
| 改为 3 秒快速倒计时跑完 | 停在 `00:00`、网页标题变「休息一下」、主按钮被禁用置灰 | ✅ 归零保护 |

### 4. 提交任务二

在浏览器中验证无误后，提交任务二代码：

```bash title="任务二提交日志"
💻 [Bash]:
$ cd /home/yoake/Code/pomodoro && git add index.html && git commit -m "feat: 实现核心倒计时与四态状态流转"

📋 [Result]:
[main 6764dc2] feat: 实现核心倒计时与四态状态流转
 1 file changed, 113 insertions(+), 3 deletions(-)
```

---

## 阶段总结

此时的 Git 提交历史如下：

```text title="git log --oneline 提交历史"
6764dc2 (HEAD -> main) feat: 实现核心倒计时与四态状态流转
17db13e feat: 完成骨架搭建与静态样式
74b2ef9 docs: 建立三步实施计划
e629d7c docs: 建立番茄钟最简需求卡
```

每个提交都对应一个明确的阶段。接下来处理任务三：本地持久化、跨天重置与边界异常防护。

[下一步：盯差量与修边界（任务三）](/case-timer/bug/){.read-more}
