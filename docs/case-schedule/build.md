---
title: 拆成四步
icon: carbon:play-filled
permalink: /case-schedule/build/
createTime: 2026/10/28 10:20:00
---

番茄钟你可以一口气让它写完——120 行，你读得完。

课程表不行。四个文件加起来 200 多行，一次生成你没法读，也没法判断哪里错了。所以这次不追求「一次给对」，追求**每一步都能看见变化**。

四条指令，四次提交。每一条只做一件事。

## 先看文件分工

| 文件 | 里面有什么 | 谁引用它 |
|---|---|---|
| `index.html` | 空壳：一个 `<table>`、两个按钮、一行提示 | 引入 CSS 和两个 JS |
| `style.css` | 全部样式 | —— |
| `data.js` | `const COURSES = [...]` | `app.js` |
| `app.js` | 算位置、渲染、切周次、查冲突 | —— |

顺序也固定：`data.js` 先加载，`app.js` 后加载。反过来 `app.js` 一跑就找不到 `COURSES`，报 `COURSES is not defined`。

::: warning 三条不要用 export / import
你可能在别处见过 `export const COURSES`。这里不用。

ES 模块在 `file://` 下会被浏览器的跨域策略拦掉——**双击打开直接白屏**，报一个和你的代码毫无关系的 CORS 错误。大一下学期不需要在这种地方耗一晚上。

用最老的办法：两个普通 `<script>`，前一个定义的变量，后一个直接用。

```html
<script src="data.js"></script>
<script src="app.js"></script>
```

代价是变量都挂在全局。**这是有意的交换**：换双击能用。
:::

## 第 1 条：骨架 + 静态渲染

```text
在 schedule 文件夹里，用原生 HTML/CSS/JS 建四个文件：
index.html、style.css、data.js、app.js。

data.js 里放这 6 门课，字段是 name/teacher/room/day/start/span/weeks：
高等数学 A(2) 周一第1节连2节 王 B203 每周
数据结构 周一第3节连2节 李 C105 每周
线性代数 周三第1节连2节 孙 B101 单周
大学物理 周三第1节连2节 周 B101 双周
程序设计实验 周四第5节连2节 吴 机房3 每周
马克思主义基本原理 周四第5节连2节 郑 E201 每周

app.js：读 COURSES，渲染成 6 行 5 列的表格，第一列是节次 1-6，表头是周一到周五。
这一版只做渲染：暂时不要处理 span 合并，不要做单双周过滤，不要做周次切换。

要求：
1. 用两个普通 script 标签引入，不要用 export/import，我要双击能打开
2. 渲染只写一个 render() 函数，数据到 HTML 一步到位，不要框架
3. 每门课的格子里显示：课程名、老师、地点
```

它给你的大概是这样：

:::: demo title="第一版 · 能渲染，但不对" desc="表出来了。现在用验收标准第 2 条逐门对一遍——你会发现对不上。"

```html
<div class="app">
  <h3>我的课表</h3>
  <table id="grid"><thead><tr></tr></thead><tbody></tbody></table>
</div>

<style>
  .app { font-family: system-ui, "PingFang SC", sans-serif; color: #1d2330; background: #f6f7f9; padding: 16px; border-radius: 10px; }
  h3 { margin: 0 0 12px; font-size: 16px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #e2e6ec; padding: 6px 8px; text-align: left; vertical-align: top; }
  thead th { background: #eceff4; text-align: center; }
  td.p { background: #f0f2f6; text-align: center; color: #6b7381; width: 34px; }
  td.empty { background: #fff; }
  td.course { background: #fff; }
  td.course .n { font-weight: 600; display: block; }
  td.course .m { color: #6b7381; font-size: 12px; }
</style>

<script>
  const COURSES = [
    { name: '高等数学 A(2)', teacher: '王', room: 'B203', day: 1, start: 1, span: 2, weeks: 'all' },
    { name: '数据结构', teacher: '李', room: 'C105', day: 1, start: 3, span: 2, weeks: 'all' },
    { name: '线性代数', teacher: '孙', room: 'B101', day: 3, start: 1, span: 2, weeks: 'odd' },
    { name: '大学物理', teacher: '周', room: 'B101', day: 3, start: 1, span: 2, weeks: 'even' },
    { name: '程序设计实验', teacher: '吴', room: '机房 3', day: 4, start: 5, span: 2, weeks: 'all' },
    { name: '马克思主义基本原理', teacher: '郑', room: 'E201', day: 4, start: 5, span: 2, weeks: 'all' },
  ];
  const DAYS = ['周一', '周二', '周三', '周四', '周五'];
  const PERIODS = 6;

  function render() {
    document.querySelector('#grid thead tr').innerHTML =
      '<th>节</th>' + DAYS.map((d) => '<th>' + d + '</th>').join('');
    let html = '';
    for (let p = 1; p <= PERIODS; p++) {
      html += '<tr><td class="p">' + p + '</td>';
      for (let d = 1; d <= 5; d++) {
        const c = COURSES.find((x) => x.day === d && x.start === p);
        html += c
          ? '<td class="course"><span class="n">' + c.name + '</span><span class="m">' + c.teacher + ' · ' + c.room + '</span></td>'
          : '<td class="empty"></td>';
      }
      html += '</tr>';
    }
    document.querySelector('#grid tbody').innerHTML = html;
  }
  render();
</script>
```

::::

## 第一版有四个问题

对着验收标准看，四条全不达标：

| # | 你看到的 | 实际原因 | 对应验收 |
|---|---|---|---|
| 1 | 周一第 1 节有高数，第 2 节空着 | `span` 没被用，一门课只画一格 | 3 |
| 2 | 周三第 1 节只有线性代数，**大学物理凭空消失** | 两门课同一天同节，`find` 只返回第一门 | 2 |
| 3 | 周四第 5 节只剩程序设计实验，没有冲突提示 | 同上，且冲突检测根本没写 | 6 |
| 4 | 没有周次按钮，页面上永远是同一个样子 | 没做 | 5 |

第 2 条最值得停一下：**课程消失，页面不报错。** 这就是这一章开头说的那种错误——界面看起来很正经，数据已经丢了。

::: tip 这一步就该提交
```bash
git add .
git commit -m "骨架 + 静态渲染，6 门课能显示（合并和周次未做）"
```
带着已知问题提交，比"改到全部正确再提交"安全。下一版要是改坏了，你能回到这个能跑的状态。
:::

## 第 2 条：合并单元格

这条指令要给足信息，因为它是这一章算法的核心：

```text
现在修合并。

周一第 1 节的高数应该占两行（span=2），现在只占一行。
要求：
1. 不要把 rowspan 直接写在渲染循环里硬算。先写一个 buildColumns(week)，
   返回 5 个数组，每个数组 6 个位置，放 {course, span} 或 null 或 'skip'
2. 'skip' 表示这一格被上面的 rowspan 占了，渲染时跳过它，不要输出 <td>
3. 同一格如果已经放过课，先来的赢，后来的不要覆盖
4. 渲染循环只读 buildColumns 的结果，不再做任何计算
```

关键在于**先算好一张地图，再照着地图画**。

```js
function buildColumns(week) {
  const list = COURSES.filter((c) => matchesWeek(c, week));
  const cols = DAYS.map(() => Array(PERIODS).fill(null));

  for (const c of list) {
    const col = cols[c.day - 1];   // 人话的 1-5 → 下标 0-4
    const s = c.start - 1;         // 人话的 1-6 → 下标 0-5
    if (col[s]) continue;          // 这格有课了，先来的赢
    col[s] = { course: c, span: c.span || 1 };
    for (let k = 1; k < (c.span || 1); k++) col[s + k] = 'skip';
  }
  return cols;
}
```

渲染变成：

```js
for (let d = 0; d < DAYS.length; d++) {
  const cell = cols[d][p];
  if (cell === 'skip') continue;                       // 被上面占了，这一格不存在
  if (cell) {
    html += `<td class="course" rowspan="${cell.span}">…</td>`;
  } else {
    html += '<td class="empty"></td>';
  }
}
```

::: warning `'skip'` 和 `null` 是两件事
`null` 是「这一格空着，画一个空格子」。
`'skip'` 是「这一格不存在，一个字都别吐」。

混成一个值，表格就会多出格子、整体右移。这是这类表格最常见的错。
:::

跑一遍，看周一第 1 节：格子跨两行了。

## 第 3 条：单双周 + 周次

```text
加单双周和周次切换。

1. 加一个 matchesWeek(course, week) 函数，只在这一个地方判断单双周
2. 页面上加「‹ 第 N 周 ›」三个元素，N 从 1 到 20 循环
3. 周次存 localStorage，刷新后保持
4. 判断单双周要写 week % 2，不要写死
```

```js
function matchesWeek(c, week) {
  if (c.weeks === 'odd') return week % 2 === 1;
  if (c.weeks === 'even') return week % 2 === 0;
  return true;
}
```

第 1 条那句「只在这一个地方判断」是给你自己留的后路。第三节你会遇到单双周反了的 bug——那时候只要改这一行，而不是满项目找 `% 2`。

第 3 条的坑（`localStorage` 拿回来的是字符串）在案例一里已经摔过一次了，这里同一招：`parseInt` + 兜底。

## 第 4 条：冲突提示

```text
加冲突检测。

1. 两门课「同一天、节次区间相交、周次有交集」才算冲突
2. 节次相交用 start 和 span 算，不要用 start === start
3. 冲突的课在表格里标红
4. 表格上方显示一行文字：⚠ N 处冲突：课A 和 课B
5. 只提示，不删除、不覆盖、不阻止渲染
```

```js
function overlap(a, b) {
  if (a.day !== b.day) return false;
  // 两段区间不相交：a 结束得比 b 开始还早，或反之
  if (a.start >= b.start + span(b) || b.start >= a.start + span(a)) return false;
  if (a.weeks !== 'all' && b.weeks !== 'all' && a.weeks !== b.weeks) return false;
  return true;
}
```

第 1 条那个「周次有交集」容易被忽略：单周的课和双周的课占同一格，**不算冲突**——一次只有一门在上。写成 `start === start` 就判冲突，你的线性代数和大学物理会一起变红，然后你就会去改一门本来没问题的课。

## 四次提交

| 提交 | 改了什么 | 大概行数 | 这时候能验哪条标准 |
|---|---|---|---|
| 1 | 四个文件 + 静态渲染 | ~70 | 1 |
| 2 | `buildColumns` + `rowspan` | ~25 | 3 |
| 3 | 单双周 + 周次 + localStorage | ~30 | 4、5 |
| 4 | 冲突检测 + 标红 + 提示 | ~25 | 6 |

每次不超过 30 行 diff。**这就是"拆成四步"的全部意义**：出了问题，你只需要看最近这 30 行。

## 现在读一遍代码

四个文件，你只需要认三处：

1. **`data.js` 第一行** —— `const COURSES = [`。所有内容都在这里，界面长什么样与它无关。
2. **`buildColumns`** —— 数据变成地图的地方。这是整个项目的脑子。
3. **`render`** —— 地图变成 HTML 的地方。这里不该有任何判断逻辑，只该照着地图画。

第三点是判断标准：**如果 `render` 里出现了 `if (c.weeks === 'odd')`，说明算位置的逻辑漏到画图里了。** 这种代码第一次能跑，第二次改就崩。

## 现在做一次验收

六条打勾了：

- 表头对、节次对
- 十门课都在格子里
- 连上的课合并成一格
- 单双周跟着周次换
- 刷新记得第几周
- 周四第 5 节标红，右上角有冲突提示

剩两条没验：手机宽度（第 7 条）和「加一门课只改一处」（第 8 条）。

这两条**最好在你心情好的时候验**。因为它们是这一章里唯一会把你打回白屏的两件事。

[四个藏起来的 bug](/case-schedule/debug/)
