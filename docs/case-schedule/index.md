---
title: 案例二 · 课程表
icon: carbon:calendar-heat-map
permalink: /case-schedule/
createTime: 2026/10/28 10:12:00
---

番茄钟只有一个数字。数据错了，界面立刻不对，你看得见。

课程表不一样。它的数据是一张表，界面是这张表的投影。数据里错一天，界面上就有一个格子跑到别人家里——而页面看起来完全正常。

这一章要练的就是这件事：**先把数据想清楚，再让界面长出来。**

## 你会做出什么

先看成品。点右上角的 `‹` `›` 换周次，单双周的课会跟着换：

:::: demo title="完成版课程表" desc="十门课、单双周、连上两节合并成一格、冲突标红。刷新页面，周次还记得。"

```html
<div class="app">
  <div class="bar">
    <button id="prev" title="上一周">‹</button>
    <div class="wk">第 <b id="wnum">1</b> 周 · <span id="wpar">单周</span></div>
    <button id="next" title="下一周">›</button>
    <span class="spacer"></span>
    <span id="warn" class="warn" hidden></span>
  </div>
  <div class="scroller">
    <table id="grid">
      <thead>
        <tr><th class="corner">节</th></tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
  <p class="foot">点 ‹ › 切周次。单双周的课会跟着换。刷新页面，周次还记得。</p>
</div>

<style>
  .app {
    font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #1d2330;
    background: #f6f7f9;
    padding: 16px;
    border-radius: 10px;
  }
  .bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .bar button {
    width: 30px; height: 30px; font-size: 18px; line-height: 1;
    border: 1px solid #d3d8e0; background: #fff; color: #1d2330;
    border-radius: 8px; cursor: pointer;
  }
  .bar button:hover { background: #eef1f6; }
  .wk { font-size: 15px; font-variant-numeric: tabular-nums; }
  .wk b { font-size: 17px; }
  .spacer { flex: 1; }
  .warn {
    font-size: 13px; padding: 4px 10px; border-radius: 999px;
    background: #fff1f0; color: #b42318; border: 1px solid #ffd2cc;
  }
  .scroller { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; min-width: 560px; font-size: 13px; }
  th, td { border: 1px solid #e2e6ec; padding: 6px 8px; text-align: left; vertical-align: top; }
  thead th { background: #eceff4; font-weight: 600; text-align: center; }
  th.corner { width: 34px; text-align: center; }
  td.p { background: #f0f2f6; text-align: center; color: #6b7381; font-variant-numeric: tabular-nums; }
  td.empty { background: #fff; }
  td.course { background: #fff; }
  td.course .n { font-weight: 600; display: block; }
  td.course .m { color: #6b7381; font-size: 12px; }
  td.bad { background: #fff1f0; }
  td.bad .n { color: #b42318; }
  .tag {
    display: block; width: max-content; font-size: 11px; padding: 0 5px; border-radius: 4px;
    background: #eaeef5; color: #4a5361; margin-top: 3px;
  }
  .foot { font-size: 12px; color: #7b8392; margin: 12px 0 0; }
  @media (prefers-color-scheme: dark) {
    .app { background: #141821; color: #e6eaf2; }
    .bar button { background: #1c2230; border-color: #303848; color: #e6eaf2; }
    .bar button:hover { background: #232b3b; }
    th, td { border-color: #2b3341; }
    thead th { background: #1d2430; }
    td.p { background: #1a2029; color: #93a0b4; }
    td.empty, td.course { background: #171c25; }
    td.bad { background: #2a1917; }
    td.bad .n { color: #ff8c7e; }
    .tag { background: #232b3b; color: #a9b4c4; }
    .warn { background: #2a1917; color: #ff8c7e; border-color: #442420; }
    .foot { color: #8b95a6; }
  }
</style>

<script>
  const COURSES = [
    { name: '高等数学 A(2)', teacher: '王', room: 'B203', day: 1, start: 1, span: 2, weeks: 'all' },
    { name: '数据结构', teacher: '李', room: 'C105', day: 1, start: 3, span: 2, weeks: 'all' },
    { name: '概率论', teacher: '陈', room: 'A302', day: 2, start: 1, span: 2, weeks: 'even' },
    { name: '大学英语(2)', teacher: '赵', room: 'D401', day: 2, start: 3, span: 2, weeks: 'all' },
    { name: '线性代数', teacher: '孙', room: 'B101', day: 3, start: 1, span: 2, weeks: 'odd' },
    { name: '大学物理', teacher: '周', room: 'B101', day: 3, start: 1, span: 2, weeks: 'even' },
    { name: '程序设计实验', teacher: '吴', room: '机房 3', day: 4, start: 5, span: 2, weeks: 'all' },
    { name: '马克思主义基本原理', teacher: '郑', room: 'E201', day: 4, start: 5, span: 2, weeks: 'all' },
    { name: '体育（篮球）', teacher: '冯', room: '体育馆', day: 5, start: 3, span: 2, weeks: 'all' },
    { name: '形势与政策', teacher: '何', room: 'E105', day: 5, start: 5, span: 2, weeks: 'odd' },
  ];

  const DAYS = ['周一', '周二', '周三', '周四', '周五'];
  const PERIODS = 6;
  const KEY = 'vibe-schedule:week';

  const span = (c) => c.span || 1;

  function matchesWeek(c, week) {
    if (c.weeks === 'odd') return week % 2 === 1;
    if (c.weeks === 'even') return week % 2 === 0;
    return true;
  }

  function overlap(a, b) {
    if (a.day !== b.day) return false;
    if (a.start >= b.start + span(b) || b.start >= a.start + span(a)) return false;
    if (a.weeks !== 'all' && b.weeks !== 'all' && a.weeks !== b.weeks) return false;
    return true;
  }

  function loadWeek() {
    try {
      const v = parseInt(localStorage.getItem(KEY), 10);
      return v >= 1 && v <= 20 ? v : 1;
    } catch (e) {
      return 1;
    }
  }

  function saveWeek(w) {
    try {
      localStorage.setItem(KEY, String(w));
    } catch (e) {}
  }

  let week = loadWeek();

  function buildColumns(w) {
    const list = COURSES.filter((c) => matchesWeek(c, w)).map((c) => ({ ...c, conflict: false }));
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (overlap(list[i], list[j])) {
          list[i].conflict = true;
          list[j].conflict = true;
        }
      }
    }
    const cols = DAYS.map(() => Array(PERIODS).fill(null));
    for (const c of list) {
      const col = cols[c.day - 1];
      const s = c.start - 1;
      if (!col || s < 0 || s + span(c) > PERIODS) continue;
      if (col[s]) continue;
      col[s] = { course: c, span: span(c) };
      for (let k = 1; k < span(c); k++) col[s + k] = 'skip';
    }
    return cols;
  }

  function cellText(c) {
    const weeks = c.weeks === 'all' ? '' : '<span class="tag">' + (c.weeks === 'odd' ? '单周' : '双周') + '</span>';
    return '<span class="n">' + c.name + '</span><span class="m">' + c.teacher + ' · ' + c.room + '</span>' + weeks;
  }

  function render() {
    const cols = buildColumns(week);
    document.querySelector('#grid thead tr').innerHTML =
      '<th class="corner">节</th>' + DAYS.map((d) => '<th>' + d + '</th>').join('');

    let html = '';
    for (let p = 0; p < PERIODS; p++) {
      html += '<tr><td class="p">' + (p + 1) + '</td>';
      for (let d = 0; d < DAYS.length; d++) {
        const cell = cols[d][p];
        if (cell === 'skip') continue;
        if (cell) {
          const c = cell.course;
          html += '<td class="course' + (c.conflict ? ' bad' : '') + '" rowspan="' + cell.span + '">' + cellText(c) + '</td>';
        } else {
          html += '<td class="empty"></td>';
        }
      }
      html += '</tr>';
    }
    document.querySelector('#grid tbody').innerHTML = html;

    document.querySelector('#wnum').textContent = week;
    document.querySelector('#wpar').textContent = week % 2 === 1 ? '单周' : '双周';

    const bad = [];
    const list = COURSES.filter((c) => matchesWeek(c, week));
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++)
        if (overlap(list[i], list[j])) bad.push(list[i].name + ' 和 ' + list[j].name);

    const warn = document.querySelector('#warn');
    if (bad.length) {
      warn.hidden = false;
      warn.textContent = '⚠ ' + bad.length + ' 处冲突：' + bad.join('；');
    } else {
      warn.hidden = true;
    }
  }

  document.querySelector('#prev').onclick = () => {
    week = week > 1 ? week - 1 : 20;
    saveWeek(week);
    render();
  };
  document.querySelector('#next').onclick = () => {
    week = week < 20 ? week + 1 : 1;
    saveWeek(week);
    render();
  };

  render();
</script>
```

::: tip 示例数据里有一处冲突
周四第 5 节，「程序设计实验」和「马克思主义基本原理」撞在一起了。这是我故意留的——不然你没法看到冲突提示长什么样。真课表里出现这个红格子，说明你得去找教务改课了。
:::

## 为什么第二个案例是它

| | 案例一 · 番茄钟 | 案例二 · 课程表 |
|---|---|---|
| 数据 | 一个数字 + 一个布尔值 | 十门课，每门七个字段 |
| 界面 | 一块显示区 | 6 × 5 的表格，还要合并单元格 |
| 最难的地方 | 状态不同步 | 数据的位置算错 |
| 出错长相 | 数字跳、按钮失灵 | 页面很正常，就是格子跑偏了 |
| 文件 | 一个 `index.html` | 四个文件，一个放数据 |

番茄钟练的是「状态不能有两个源头」。课程表练的是**「界面是数据的投影」**——这句话你在第 1 章听过，这次要亲手验证一遍。

而且这次有四个文件。你会第一次遇到「我改了 `data.js`，但页面没变」这种事。

## 这一章会发生什么

| 小节 | 你要做的事 | 大概花多久 |
|---|---|---|
| [需求分析](/case-schedule/requirement/) | 访谈 + 把数据结构先定下来 | 25 分钟 |
| [定计划](/case-schedule/plan/) | 让它先给数据结构，再给步骤 | 15 分钟 |
| [生成并运行](/case-schedule/build/) | 分四条指令，每一条都能看到变化 | 50 分钟 |
| [发现问题并修改](/case-schedule/debug/) | 四个位置类的 bug，一个比一个阴 | 45 分钟 |
| [检查并交付](/case-schedule/ship/) | 边界测试 + README + 部署 | 30 分钟 |

读一遍大概 40 分钟。真动手做，加上你自己的调试，两个半小时左右。

## 开工准备

```bash
cd ~/dev/vibe-lab
mkdir schedule
cd schedule
git init
code .
```

::: warning 这一章会用到四个文件
`index.html`、`style.css`、`data.js`、`app.js`。

只有一个 HTML 的项目，你可以靠肉眼管住它。四个文件的项目不行——**你必须知道哪个文件里有什么**。这是本章真正要教的东西，比表格本身重要。
:::
