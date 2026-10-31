---
title: 案例二 · 课程表
icon: carbon:calendar-heat-map
permalink: /case-schedule/
createTime: 2026/10/28 10:12:00
---

课程表比番茄钟更进一步：不仅涉及多字段数据结构契约，还要处理周次过滤（每周/单周/双周）、跨节次单元格合并（`rowspan`）以及多门课程在同一时间段冲突时的边界排版。

本案例全程使用 **终端 `pi` CLI**（可直接配合 `tmux` 后台持久化）与编程智能体进行结对编程，依然严格贯彻「想清楚 → 定计划 → 生成并运行 → 盯差量与修边界 → 检查并交付」五步循环，杜绝复杂框架，打造一个双击即开的单文件课程表。

## 先看完成版

可以在下方试用完整效果：点击 `‹` `›` 切换 1–20 周。第 1 周与第 2 周的单双周课程会交替呈现；连续节次的课程会自动纵向合并；周三第 1–2 节的冲突课程会以红框标出，并在上方警告栏详细列出冲突课程名与时段。

::::: demo title="完成版课程表" desc="支持 1–20 周次切换、跨节次 rowspan 合并、单双周交替与三条件冲突检测（先录入者胜+标红，警告栏保留全部）。"

:::: code-tabs

@tab HTML

```html
<div class="app">
  <div class="week-bar">
    <button id="prevWeekBtn" type="button" aria-label="上一周">上一周</button>
    <div id="weekDisplay" class="week-display" aria-live="polite">第 1 周 / 共 20 周（单周）</div>
    <button id="nextWeekBtn" type="button" aria-label="下一周">下一周</button>
  </div>

  <div id="warningBar" class="warning-bar" role="alert" hidden></div>

  <div class="table-wrap">
    <table class="schedule" aria-label="周课表">
      <thead>
        <tr>
          <th class="col-period" scope="col">节次</th>
          <th scope="col">周一</th>
          <th scope="col">周二</th>
          <th scope="col">周三</th>
          <th scope="col">周四</th>
          <th scope="col">周五</th>
        </tr>
      </thead>
      <tbody id="gridBody"></tbody>
    </table>
  </div>
</div>
```

@tab CSS

```css
:root {
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --border: #e2e8f0;
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --primary: #2563eb;
  --primary-bg: #eff6ff;
  --primary-border: #bfdbfe;
  --warn-bg: #fef2f2;
  --warn-border: #fecaca;
  --warn-text: #991b1b;
}
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.week-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--bg-page);
  border-radius: 8px;
  border: 1px solid var(--border);
}
.week-bar button {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
}
.week-bar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.week-display {
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.warning-bar {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: var(--warn-bg);
  border: 1px solid var(--warn-border);
  border-radius: 8px;
  color: var(--warn-text);
  font-size: 13px;
  line-height: 1.5;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}
table.schedule {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: center;
}
table.schedule th, table.schedule td {
  border: 1px solid var(--border);
  padding: 8px 6px;
  vertical-align: top;
}
table.schedule th {
  background: var(--bg-page);
  font-weight: 600;
  font-size: 13px;
}
.col-period { width: 68px; }
.period-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.course-card {
  background: var(--primary-bg);
  border: 1px solid var(--primary-border);
  border-radius: 6px;
  padding: 6px;
  text-align: left;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.course-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  line-height: 1.3;
}
.course-meta {
  font-size: 11px;
  color: var(--text-muted);
}
.tag-week {
  display: inline-block;
  font-size: 10px;
  padding: 1px 4px;
  background: #e2e8f0;
  color: #475569;
  border-radius: 4px;
  width: fit-content;
  margin-top: 2px;
}
td.is-conflict .course-card {
  border-color: #ef4444;
  background: #fef2f2;
  box-shadow: 0 0 0 1px #ef4444;
}
td.is-conflict .course-name { color: #dc2626; }
.conflict-badge {
  display: inline-block;
  font-size: 10px;
  padding: 1px 4px;
  background: #ef4444;
  color: #fff;
  border-radius: 4px;
  margin-right: 4px;
}
```

@tab JavaScript

```js
const COURSES = [
  { name: "高等数学", teacher: "张伟", room: "A101", day: 1, start: 1, span: 2, weeks: "all" },
  { name: "线性代数", teacher: "李娜", room: "B203", day: 2, start: 3, span: 2, weeks: "all" },
  { name: "大学英语", teacher: "王芳", room: "C305", day: 3, start: 1, span: 2, weeks: "all" },
  { name: "数据结构", teacher: "刘强", room: "A204", day: 4, start: 3, span: 2, weeks: "all" },
  { name: "操作系统", teacher: "陈静", room: "B102", day: 5, start: 1, span: 2, weeks: "odd" },
  { name: "计算机网络", teacher: "赵磊", room: "C201", day: 5, start: 1, span: 2, weeks: "even" },
  { name: "体育（羽毛球）", teacher: "孙鹏", room: "体育馆", day: 2, start: 5, span: 2, weeks: "all" },
  { name: "编译原理", teacher: "周敏", room: "A305", day: 3, start: 1, span: 2, weeks: "all" }
];

let currentWeek = 1;

function weeksIntersect(a, b) {
  if (a === "all" || b === "all") return true;
  return a === b;
}

function periodsOverlap(startA, spanA, startB, spanB) {
  const endA = startA + spanA - 1;
  const endB = startB + spanB - 1;
  return Math.max(startA, startB) <= Math.min(endA, endB);
}

function getConflictsThisWeek(week) {
  const thisWeekCourses = COURSES.filter(c => {
    if (c.weeks === "all") return true;
    if (c.weeks === "odd") return week % 2 === 1;
    if (c.weeks === "even") return week % 2 === 0;
    return false;
  });

  const pairs = [];
  for (let i = 0; i < thisWeekCourses.length; i++) {
    for (let j = i + 1; j < thisWeekCourses.length; j++) {
      const a = thisWeekCourses[i];
      const b = thisWeekCourses[j];
      if (a.day === b.day && periodsOverlap(a.start, a.span, b.start, b.span) && weeksIntersect(a.weeks, b.weeks)) {
        pairs.push([a, b]);
      }
    }
  }
  return { list: thisWeekCourses, pairs };
}

function render() {
  const prevBtn = document.getElementById("prevWeekBtn");
  const nextBtn = document.getElementById("nextWeekBtn");
  const weekDisplay = document.getElementById("weekDisplay");
  const warningBar = document.getElementById("warningBar");
  const gridBody = document.getElementById("gridBody");

  prevBtn.disabled = currentWeek <= 1;
  nextBtn.disabled = currentWeek >= 20;
  const parity = currentWeek % 2 === 1 ? "单周" : "双周";
  weekDisplay.textContent = `第 ${currentWeek} 周 / 共 20 周（${parity}）`;

  const { list, pairs } = getConflictsThisWeek(currentWeek);

  if (pairs.length > 0) {
    warningBar.hidden = false;
    const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五"];
    const messages = pairs.map(([a, b]) => {
      const start = Math.min(a.start, b.start);
      const end = Math.max(a.start + a.span - 1, b.start + b.span - 1);
      return `${DAY_NAMES[a.day - 1]} 第${start}–${end}节：${a.name} 与 ${b.name}`;
    });
    warningBar.textContent = `【课程冲突】` + messages.join("；");
  } else {
    warningBar.hidden = true;
    warningBar.textContent = "";
  }

  // Grid matrix [day 1..5][period 1..6]
  const grid = Array.from({ length: 5 }, () => Array(6).fill(null));
  const conflictCourseSet = new Set(pairs.flat());

  for (const course of list) {
    const d = course.day - 1;
    const s = course.start - 1;
    if (grid[d][s] !== null) continue; // 先录入者占位，重叠者进警告栏
    grid[d][s] = { course, span: course.span, isConflict: conflictCourseSet.has(course) };
    for (let k = 1; k < course.span; k++) {
      if (s + k < 6) grid[d][s + k] = "skip";
    }
  }

  let tbodyHtml = "";
  for (let p = 0; p < 6; p++) {
    tbodyHtml += `<tr><th class="col-period period-label">第 ${p + 1} 节</th>`;
    for (let d = 0; d < 5; d++) {
      const cell = grid[d][p];
      if (cell === "skip") continue;
      if (cell) {
        const c = cell.course;
        const conflictClass = cell.isConflict ? " is-conflict" : "";
        const badge = cell.isConflict ? `<span class="conflict-badge">冲突</span>` : "";
        const weekTag = c.weeks === "all" ? "" : `<span class="tag-week">${c.weeks === "odd" ? "单周" : "双周"}</span>`;
        tbodyHtml += `<td class="${conflictClass}" rowspan="${cell.span}">
          <div class="course-card">
            <div class="course-name">${badge}${c.name}</div>
            <div class="course-meta">${c.teacher} · ${c.room}</div>
            ${weekTag}
          </div>
        </td>`;
      } else {
        tbodyHtml += `<td></td>`;
      }
    }
    tbodyHtml += `</tr>`;
  }
  gridBody.innerHTML = tbodyHtml;
}

document.getElementById("prevWeekBtn").addEventListener("click", () => {
  if (currentWeek > 1) { currentWeek--; render(); }
});
document.getElementById("nextWeekBtn").addEventListener("click", () => {
  if (currentWeek < 20) { currentWeek++; render(); }
});

render();
```

::::
:::::

## 与 Agent 的对话过程

这个案例同样不需要我们自己手写代码。我们通过终端中的 Agent，完成了一次需求梳理和三步渐进式实现，在关键节点完成了 6 次 Git 提交。

下面按顺序列出当时的对话记录、怎么向 Agent 提要求，以及每次生成的文件变化：

::::: timeline
- 步骤一 · 保存需求卡 · `9240319` docs: 建立课程表最简需求卡
  time="2026-10-28"

  - **怎么跟它说**：先不要写代码，让它针对课程表的数据结构提问。通过 8 个关键问题确认字段范围、单双周算法和重叠冲突的处理方式。
  - **确认的要点**：明确 7 个核心课程字段，支持 1–20 周切换，冲突时表格保留先录入者并标红，上方警告栏列出全部冲突课。

  ::: file-tree
  - schedule/
    - REQUIREMENT.md # 本轮生成：7 字段定义与冲突判定规则
  :::

  ![数据结构与需求访谈对话（上）：提问 8 个核心问题](/images/case-schedule/case-schedule-chat-1-requirement-1.png)

  ![数据结构与需求访谈对话（下）：确认字段与输出需求卡](/images/case-schedule/case-schedule-chat-1-requirement-2.png)

- 步骤二 · 保存实施计划 · `95dd8b9` docs: 建立三步实施计划
  time="2026-10-28"

  - **怎么跟它说**：要求它在动代码前，先拆解出分步计划并写入 `TODO.md`，每个步骤都要给出明确的手动测试方法。
  - **确认的要点**：拆分为「空网格骨架 → 数据渲染与合并 → 冲突检测与周次保存」三步，依然严禁提前写代码。

  ::: file-tree
  - schedule/
    - REQUIREMENT.md
    - TODO.md # 本轮生成：三步实施清单
  :::

  ![制定实施计划对话：把课程表拆解为三步任务与验收方案](/images/case-schedule/case-schedule-chat-2-todo.png)

- 步骤三 · 任务一交付 · `7446120` feat: 完成课表骨架搭建与基础网格
  time="2026-10-28"

  - **怎么跟它说**：派发第一步任务，只做 5×6 的空表格网格和周次切换栏，不要提前写课程数据渲染。
  - **确认的要点**：页面呈现干净的空课表网格，顶部有上一周/下一周切换栏，双击即可在浏览器预览布局。

  ::: file-tree
  - schedule/
    - index.html # 本轮生成：5×6 原生课表网格与切换栏（暂无数据）
    - REQUIREMENT.md
    - TODO.md
  :::

  ![任务一派发与交付对话：审查空表格网格与周次栏](/images/case-schedule/case-schedule-chat-3-task1.png)

- 步骤四 · 任务二交付 · `a31b0fc` feat: 实现课程数据渲染与跨节合并
  time="2026-10-28"

  - **怎么跟它说**：派发第二步任务，把内置的 8 门课程渲染到表格中，根据当前周次过滤单双周，并实现连续节次的 `rowspan` 纵向合并。
  - **确认的要点**：切换周次时单双周课程正确交替，跨节课程自动合并单元格且不破坏表格布局。

  ::: file-tree
  - schedule/
    - index.html # 本轮修改：接入课程数据与 rowspan 跨节合并
    - REQUIREMENT.md
    - TODO.md
  :::

  ![任务二数据渲染对话（上）：派发数据接入与 rowspan 合并指令](/images/case-schedule/case-schedule-chat-4-task2-1.png)

  ![任务二数据渲染对话（下）：代码落地与占位跳过审查](/images/case-schedule/case-schedule-chat-4-task2-2.png)

- 步骤五 · 任务三交付 · `743e2ff` feat: 实现冲突检测与周次持久化
  time="2026-10-28"

  - **怎么跟它说**：派发第三步任务，加入两两比对冲突算法。冲突课程卡片标红，上方警告栏详细列出冲突名称；当前周次存入浏览器并在异常时兜底回第 1 周。
  - **确认的要点**：同天且节次重叠、周次有交集的课程正确标红通报；刷新页面后保持在上次浏览的周次。

  ::: file-tree
  - schedule/
    - index.html # 本轮修改：冲突检测算法、红框标记与周次保存
    - REQUIREMENT.md
    - TODO.md
  :::

  ![任务三冲突检测与存储对话（上）：派发冲突算法与周次保存指令](/images/case-schedule/case-schedule-chat-5-task3-1.png)

  ![任务三冲突检测与存储对话（下）：两两冲突比对与容错审查](/images/case-schedule/case-schedule-chat-5-task3-2.png)

- 步骤六 · 收尾与交付 · `40b0213` chore: 忽略本地截图
  time="2026-10-28"

  - **怎么跟它说**：手动跑完单双周切换、冲突警告和异常周次刷新等测试后，让 Agent 创建 `.gitignore` 排除测试截图并收工。
  - **确认的要点**：通过所有检查，排除本地测试图片，仓库保持干净整洁。

  ::: file-tree
  - schedule/
    - index.html # 完整单文件实现（HTML + CSS + 原生 JS）
    - REQUIREMENT.md # 需求卡
    - TODO.md # 三步实施清单
    - .gitignore # 本轮生成：忽略本地截图文件
  :::

  ![收尾与验收对话：完成检查并整理工程资产](/images/case-schedule/case-schedule-chat-6-finish.png)
:::::

::: tip 查看具体的代码与测试细节
时间线里重点展示了与 Agent 对话的过程。如果你想看每一步完整的提示词、代码改动差异以及具体的手动测试步骤，可以点击下方「下一页」按步骤阅读。
:::

## 开始之前：环境准备

在终端中新建 `schedule` 目录，初始化 Git 仓库，并使用 `pi` 启动结对编程：

```bash
mkdir -p ~/Code/schedule
cd ~/Code/schedule
git init

# 可以直接在当前终端执行 pi，或在 tmux 中持久化运行：
tmux new-session -s schedule -c ~/Code/schedule
pi
```

环境准备就绪后，点击下方「下一页」开始梳理并确定数据结构与需求卡。
