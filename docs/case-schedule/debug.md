---
title: 第四步：盯差量与修边界
icon: carbon:debug
permalink: /case-schedule/debug/
createTime: 2026/10/28 10:26:00
---

在五步循环的第四步，重点是检查代码改动（Git Diff）并测试常见边界情况。

课程表最容易出问题的两个边界：
1. **周次交叉与时段重叠算法**（为什么 `all` 与 `odd` 在同节次会冲突，而 `odd` 与 `even` 绝不冲突？）。
2. **`localStorage` 非法值处理**（当存储中被写入非法数值，或无痕模式无法存储时，页面能否安全回退？）。

本节我们将深入【任务三：冲突检测与周次持久化】，审查核心改动并完成验证。

## 派发任务三指令

```text title="任务三派发提示词"
请执行【任务三：冲突检测与周次持久化】：
- 实现两两冲突检测算法（同 day、节次区间重叠、周次有交集）。
- 网格中被冲突占位的课程卡片添加红色标记（冲突警示边框或标签）。
- 表格上方警告栏展示：若有冲突则取消 hidden，清晰列出所有冲突课程与时段（例如：【课程冲突】周三 第1–2节：大学英语 与 编译原理），无冲突时隐藏。
- 实现周次持久化：用 localStorage 记录 currentWeek，读取时做 1–20 范围校验与容错兜底（读空、损坏、越界时静默回退为 1）。
- 完成后在终端输出验收建议与快速验证方法。
```

## 审查冲突算法与存储逻辑

代码生成后，使用 `git diff` 重点审查以下两个核心处理：

:::: code-tabs

@tab 周次交集与区间重叠判定

```js
// 1. 周次是否有交集：all 与任意相交；odd 与 even 永不相交！
function weeksIntersect(a, b) {
  if (a === "all" || b === "all") return true;
  return a === b;
}

// 2. 连续节次区间是否有重叠：max(start) <= min(end)
function periodsOverlap(startA, spanA, startB, spanB) {
  const endA = startA + spanA - 1;
  const endB = startB + spanB - 1;
  return Math.max(startA, startB) <= Math.min(endA, endB);
}

// 3. 冲突三条件全量两两比对
function findAllConflictPairs(list) {
  const pairs = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (a.day === b.day && 
          periodsOverlap(a.start, a.span, b.start, b.span) && 
          weeksIntersect(a.weeks, b.weeks)) {
        pairs.push([a, b]);
      }
    }
  }
  return pairs;
}
```

@tab 周次保存与范围限制

```js
const WEEK_KEY = "schedule.currentWeek";

// 校验是否为 1–20 范围内的整数，遇到非法数据自动回退为 1
function loadWeek() {
  try {
    const raw = localStorage.getItem(WEEK_KEY);
    if (!raw) return 1;
    const val = Number(raw);
    return Number.isInteger(val) && val >= 1 && val <= 20 ? val : 1;
  } catch {
    return 1; // 隐私模式或禁用存储时安全返回 1
  }
}

function saveWeek(week) {
  try {
    localStorage.setItem(WEEK_KEY, String(week));
  } catch {}
}
```

::::

## 四项异常与边界测试

在交付之前，针对潜在边界情况在浏览器中进行测试验证：

| 测试场景 | 操作方式 | 预期表现 | 实测结果 |
| --- | --- | --- | --- |
| **单双周互斥** | 周五第 1–2 节安排了「操作系统（odd）」与「计算机网络（even）」 | 两者永不重叠，**不产生任何冲突** | ✅ 警告栏无此项 |
| **同格真实冲突** | 周三第 1–2 节安排了「大学英语（all）」与「编译原理（all）」 | 表格显示先录入的大学英语并带红色冲突标记；上方警告栏精确列出两门课名与时段 | ✅ 结构对齐不破版，数据不丢失 |
| **周次切换测试** | 临时把「编译原理」改为 `odd`（第 1 周冲突，第 2 周不冲突） | 第 1 周弹出警告栏；切到第 2 周警告栏自动清空并隐藏 | ✅ 警告栏随周次动态联动 |
| **非法周次处理** | 控制台向存储写入 `999`、`abc` 或空字符串后刷新页面 | 页面无白屏、Console 0 报错，安全回退到第 1 周 | ✅ 自动安全重置为第 1 周 |

最终完成态视觉效果如下（上方红底警告栏 + 周三第 1–2 节单元格红框高亮）：

![任务三最终完成态：冲突告警与红色高亮卡片](/images/case-schedule/task3-final.png)

## 提交任务三

测试验证通过后，让 Agent 在终端中提交任务三代码：

:::: chat title="与 Agent 对话：提交任务三代码"

{.}
冲突检测与周次持久化测试全部通过。请提交本次代码，提交信息为 "feat: 实现冲突检测与周次持久化"。

{Agent}
已调用终端命令完成提交：

```bash
$ git add index.html && git commit -m "feat: 实现冲突检测与周次持久化"
[main 743e2ff] feat: 实现冲突检测与周次持久化
 1 file changed, 230 insertions(+), 43 deletions(-)
```
::::

至此核心功能已全部实现。点击下方「下一页」，进入最后一步的全量验收与工程清理。
