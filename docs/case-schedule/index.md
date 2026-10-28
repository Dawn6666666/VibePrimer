---
title: 案例二 · 课程表
icon: carbon:calendar-heat-map
permalink: /case-schedule/
createTime: 2026/10/28 10:12:00
---

课程表比番茄钟多了两层问题：每门课有七个字段，同一份数据还要根据周次、节次和冲突规则变成表格。页面可能看起来完整，实际却漏了一门课，所以本案例先确定数据，再实现界面。

## 先看完成版

点击 `‹` `›` 切换周次。单双周课程会变化，连上的节次会合并，刷新后保留周次。

::::: demo title="完成版课程表" desc="示例含十门课和一组冲突。表格保留先录入的冲突课程并标红，上方警告列出所有冲突课程。"

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
      <thead><tr><th class="corner">节</th></tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <p class="foot">冲突时，表格保留先录入的课程；上方提示列出全部冲突课程。</p>
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
    font-size: 13px; padding: 4px 10px; border-radius: 8px;
    background: #fff1f0; color: #b42318; border: 1px solid #ffd2cc;
  }
  .scroller { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; min-width: 560px; font-size: 13px; }
  th, td { border: 1px solid #e2e6ec; padding: 6px 8px; text-align: left; vertical-align: top; }
  thead th { background: #eceff4; font-weight: 600; text-align: center; }
  th.corner { width: 34px; text-align: center; }
  td.p { background: #f0f2f6; text-align: center; color: #6b7381; }
  td.empty, td.course { background: #fff; }
  td.course .n { font-weight: 600; display: block; }
  td.course .m { color: #6b7381; font-size: 12px; }
  td.bad { background: #fff1f0; }
  td.bad .n { color: #b42318; }
  .tag {
    display: block; width: max-content; font-size: 11px; padding: 0 5px;
    border-radius: 4px; background: #eaeef5; color: #4a5361; margin-top: 3px;
  }
  .foot { font-size: 12px; color: #7b8392; margin: 12px 0 0; }
  @media (prefers-color-scheme: dark) {
    .app { background: #141821; color: #e6eaf2; }
    .bar button { background: #1c2230; border-color: #303848; color: #e6eaf2; }
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

  function matchesWeek(c, week) {
    if (c.weeks === 'odd') return week % 2 === 1;
    if (c.weeks === 'even') return week % 2 === 0;
    return true;
  }

  function activeCourses(week) {
    return COURSES.filter((c) => {
      if (!validCourse(c)) {
        console.warn('课程字段或位置不合法，已跳过：', c);
        return false;
      }
      return matchesWeek(c, week);
    }).map((c) => ({ ...c, span: courseSpan(c), conflict: false }));
  }

  function overlap(a, b) {
    if (a.day !== b.day) return false;
    if (a.start >= b.start + b.span || b.start >= a.start + a.span) return false;
    if (a.weeks !== 'all' && b.weeks !== 'all' && a.weeks !== b.weeks) return false;
    return true;
  }

  function findConflicts(list) {
    const pairs = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (overlap(list[i], list[j])) pairs.push([list[i], list[j]]);
      }
    }
    return pairs;
  }

  function loadWeek() {
    try {
      const value = Number(localStorage.getItem(KEY));
      return Number.isInteger(value) && value >= 1 && value <= 20 ? value : 1;
    } catch {
      return 1;
    }
  }

  function saveWeek(value) {
    try {
      localStorage.setItem(KEY, String(value));
    } catch {
      // 无法保存时，本次页面内仍可切周
    }
  }

  let week = loadWeek();

  function buildColumns(list, conflicts) {
    for (const [a, b] of conflicts) {
      a.conflict = true;
      b.conflict = true;
    }

    const cols = DAYS.map(() => Array(PERIODS).fill(null));
    for (const c of list) {
      const col = cols[c.day - 1];
      const start = c.start - 1;
      let canPlace = true;
      for (let k = 0; k < c.span; k++) {
        if (col[start + k] !== null) canPlace = false;
      }
      if (!canPlace) {
        console.warn('与已放置课程重叠，仅在冲突提示中保留：', c.name);
        continue;
      }
      col[start] = { course: c, span: c.span };
      for (let k = 1; k < c.span; k++) col[start + k] = 'skip';
    }
    return cols;
  }

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
  }

  function cellText(c) {
    const tag = c.weeks === 'all' ? '' : `<span class="tag">${c.weeks === 'odd' ? '单周' : '双周'}</span>`;
    return `<span class="n">${escapeHTML(c.name)}</span><span class="m">${escapeHTML(c.teacher)} · ${escapeHTML(c.room)}</span>${tag}`;
  }

  function render() {
    const list = activeCourses(week);
    const conflicts = findConflicts(list);
    const cols = buildColumns(list, conflicts);

    document.querySelector('#grid thead tr').innerHTML =
      '<th class="corner">节</th>' + DAYS.map((d) => `<th>${d}</th>`).join('');

    let html = '';
    for (let p = 0; p < PERIODS; p++) {
      html += `<tr><td class="p">${p + 1}</td>`;
      for (let d = 0; d < DAYS.length; d++) {
        const cell = cols[d][p];
        if (cell === 'skip') continue;
        if (cell) {
          const c = cell.course;
          html += `<td class="course${c.conflict ? ' bad' : ''}" rowspan="${cell.span}">${cellText(c)}</td>`;
        } else {
          html += '<td class="empty"></td>';
        }
      }
      html += '</tr>';
    }
    document.querySelector('#grid tbody').innerHTML = html;
    document.querySelector('#wnum').textContent = week;
    document.querySelector('#wpar').textContent = week % 2 === 1 ? '单周' : '双周';

    const warn = document.querySelector('#warn');
    if (conflicts.length) {
      warn.hidden = false;
      warn.textContent = `⚠ ${conflicts.length} 对课程冲突：` + conflicts.map(([a, b]) => `${a.name} 和 ${b.name}`).join('；');
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

:::: tip 示例里的冲突
周四第 5 节同时安排了“程序设计实验”和“马克思主义基本原理”。当前周表格显示先录入的程序设计实验并标红，上方提示会列出两门课。数据数组没有删除任何课程。

这里统计的是“课程对数”。三门课两两重叠会形成 3 对冲突，不写成“3 处”。
::::

## 和番茄钟相比多了什么

| | 番茄钟 | 课程表 |
| --- | --- | --- |
| 数据 | 剩余时间、运行状态、每日计数 | 十门课，每门七个字段 |
| 界面 | 数字和按钮 | 6 × 5 表格与合并单元格 |
| 主要风险 | 状态和时序 | 字段、位置、周次与冲突 |
| 运行文件 | 一个 `index.html` | `index.html`、`style.css`、`data.js`、`app.js` |

多文件项目需要知道每个文件的职责。修改课程数据时只改 `data.js`；计算位置和更新页面由 `app.js` 负责。

## 学习安排

| 小节 | 内容 | 参考用时 |
| --- | --- | --- |
| [需求分析](/case-schedule/requirement/) | 确定字段、冲突规则和验收标准 | 25–35 分钟 |
| [定计划](/case-schedule/plan/) | 安排文件和实施顺序 | 15–20 分钟 |
| [生成并运行](/case-schedule/build/) | 四个小迭代，分别验收和提交 | 50–70 分钟 |
| [调试](/case-schedule/debug/) | 排查数据、表格和冲突判断 | 40–60 分钟 |
| [交付](/case-schedule/ship/) | 边界测试、README 和可选部署 | 30–40 分钟 |

完整实践通常需要约 3 小时，可以分两次完成。

## 开工准备

在 `vibe-lab` 下新建 `schedule`，用 VS Code 打开它，再执行 `git init`。本章会创建四个运行文件，另有 `REQUIREMENT.md`、`TODO.md` 和 README 等项目文档。

[下一步：先定数据](/case-schedule/requirement/){.read-more}
