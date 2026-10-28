---
title: 拆成四步
icon: carbon:play-filled
permalink: /case-schedule/build/
createTime: 2026/10/28 10:20:00
---

下面四个生成步骤与 `TODO.md` 一一对应。每一步都先运行和验收，再提交；代码行数不作为通过标准。

## 文件分工和加载顺序

| 文件 | 职责 |
| --- | --- |
| `index.html` | 表格、按钮、提示区域，引入 CSS 和两个脚本 |
| `style.css` | 表格、冲突状态和窄屏滚动样式 |
| `data.js` | `const COURSES = [...]`，只保存课程数据 |
| `app.js` | 校验、计算位置、冲突检测、渲染和切周 |

`index.html` 末尾按顺序加载：

```html
<script src="data.js"></script>
<script src="app.js"></script>
```

如果顺序反过来，`app.js` 执行时可能找不到 `COURSES`。本版使用普通脚本，避免 `file://` 下 ES 模块加载的额外限制；代价是共享全局变量，所以变量命名要清楚。

## 第 1 步：四文件骨架和位置图

```text
按 REQUIREMENT.md 创建 index.html、style.css、data.js、app.js。
data.js 写入以下十门课，字段保持完整：
1. 高等数学 A(2)，王，B203，周一第1节连2节，all
2. 数据结构，李，C105，周一第3节连2节，all
3. 概率论，陈，A302，周二第1节连2节，even
4. 大学英语(2)，赵，D401，周二第3节连2节，all
5. 线性代数，孙，B101，周三第1节连2节，odd
6. 大学物理，周，B101，周三第1节连2节，even
7. 程序设计实验，吴，机房3，周四第5节连2节，all
8. 马克思主义基本原理，郑，E201，周四第5节连2节，all
9. 体育（篮球），冯，体育馆，周五第3节连2节，all
10. 形势与政策，何，E105，周五第5节连2节，odd

app.js 首步就使用 buildColumns + render：
- buildColumns 返回五列，每列六个位置
- 课程格为 { course, span }，空格为 null，被 rowspan 占用的位置为 'skip'
- render 遇到 'skip' 时不输出 td，课程格输出 rowspan
本步暂不做周次过滤、切周按钮和冲突提示。
```

放置课程前要检查整个连续节次区间，不能只检查起点：

```js
function buildColumns(list) {
  const cols = DAYS.map(() => Array(PERIODS).fill(null));

  for (const c of list) {
    const col = cols[c.day - 1];
    const start = c.start - 1;
    let canPlace = true;

    for (let k = 0; k < c.span; k++) {
      if (col[start + k] !== null) canPlace = false;
    }
    if (!canPlace) {
      console.warn('同格课程暂不重复放置：', c.name);
      continue;
    }

    col[start] = { course: c, span: c.span };
    for (let k = 1; k < c.span; k++) col[start + k] = 'skip';
  }
  return cols;
}
```

渲染时的核心分支是：

```js
const cell = cols[d][p];
if (cell === 'skip') continue;
if (cell) {
  html += `<td class="course" rowspan="${cell.span}">…</td>`;
} else {
  html += '<td class="empty"></td>';
}
```

`null` 表示需要输出空格，`'skip'` 表示位置已经被上一行的 `rowspan` 占用，不能再输出一个单元格。

首步验收十条数据完整、表头正确、普通课程位置正确、连上两节的课程合并。同格课程留到下一步处理。验收后提交：

```bash
git add .
git commit -m "添加课程数据与rowspan表格"
```

## 第 2 步：单双周和周次保存

```text
在第 1 步基础上添加：
1. matchesWeek(course, week)，集中处理 all / odd / even
2. 1–20 周循环切换按钮
3. localStorage 保存周次，无效或不可读时回到第 1 周
4. render 先过滤当前周课程，再调用 buildColumns
不要重写位置图结构。
```

```js
function matchesWeek(c, week) {
  if (c.weeks === 'odd') return week % 2 === 1;
  if (c.weeks === 'even') return week % 2 === 0;
  return true;
}
```

周次从 1 开始，第 1 周是单周。读取存储时用 `Number` 转换，并用 `Number.isInteger` 和范围检查确认有效。

验收周三第 1 节：第 1 周是线性代数，第 2 周是大学物理；切到第 2 周刷新后仍保持。然后提交：

```bash
git add .
git commit -m "支持单双周切换并保存周次"
```

## 第 3 步：数据校验和冲突提示

先过滤非法课程，再检测冲突和布局。非法数据不应参与冲突计算，也不能让整表停止渲染。

```js
const WEEK_TYPES = ['all', 'odd', 'even'];
const courseSpan = (c) => c.span === undefined ? 1 : c.span;

function validCourse(c) {
  const span = courseSpan(c);
  return c && ['name', 'teacher', 'room'].every((key) => typeof c[key] === 'string')
    && Number.isInteger(c.day) && c.day >= 1 && c.day <= DAYS.length
    && Number.isInteger(c.start) && c.start >= 1 && c.start <= PERIODS
    && Number.isInteger(span) && span >= 1 && c.start + span - 1 <= PERIODS
    && WEEK_TYPES.includes(c.weeks);
}
```

对每门非法课程调用 `console.warn` 并跳过。漏写 `span` 可按 1 处理，`span: 0` 和 `weeks: 'oddd'` 则属于非法数据。

冲突要同时满足同一天、节次相交、周次有交集：

```js
function overlap(a, b) {
  if (a.day !== b.day) return false;
  if (a.start >= b.start + b.span || b.start >= a.start + a.span) return false;
  if (a.weeks !== 'all' && b.weeks !== 'all' && a.weeks !== b.weeks) return false;
  return true;
}
```

可以用四种情况检查判断：

| 课程 A | 课程 B | 是否冲突 |
| --- | --- | --- |
| 周三第 1 节连 2 节，odd | 同时间，even | 否，周次没有交集 |
| 周三第 1 节连 2 节，all | 同时间，odd | 是 |
| 周三第 1 节连 2 节 | 周三第 3 节开始 | 否，只是首尾相接 |
| 周三第 1 节连 3 节 | 周三第 3 节开始 | 是 |

`findConflicts` 返回冲突课程对。`buildColumns(list, conflicts)` 先把涉及冲突的课程标为 `conflict: true`，再按原规则布局；后到课程不单独占格，但名字仍出现在警告中。警告写“N 对课程冲突”。

课程名、老师和教室通过 `innerHTML` 输出前要转义，或改用 DOM 节点和 `textContent`。完成版使用了 `escapeHTML`，避免课程文本被当成标签。

验收第 6 条和一项非法数据测试后提交：

```bash
git add .
git commit -m "添加数据校验和冲突提示"
```

## 第 4 步：窄屏与合法加课

```css
.scroller { overflow-x: auto; }
table { min-width: 560px; }
```

滚动样式放在表格外层容器，`min-width` 防止列被压成逐字换行。在 `data.js` 临时加入一门合法课程：

```js
{ name: '测试选修', teacher: '测', room: 'A101', day: 2, start: 5, span: 1, weeks: 'all' },
```

刷新后应出现在周二第 5 节，其他运行文件不用改。验证完删除这门测试课，再刷新确认恢复。最后提交窄屏样式：

```bash
git add .
git commit -m "适配窄屏课程表"
```

四个提交对应四个可恢复节点。`render` 可以保留 `if (cell === 'skip')` 等展示分支，但周次匹配、课程位置和冲突关系应由各自的函数计算，不要全塞进 HTML 拼接循环。

[下一步：排查四类典型问题](/case-schedule/debug/){.read-more}
