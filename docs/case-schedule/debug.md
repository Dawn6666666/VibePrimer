---
title: 四类典型问题
icon: carbon:debug
permalink: /case-schedule/debug/
createTime: 2026/10/28 10:26:00
---

这一节作为诊断手册使用。如果生成阶段出现相同症状，可以按对应方法定位；也可以先提交当前可用版本，再用文中的错误代码做故障练习。严格按照完成版操作的人不一定能自然复现每个问题。

## 问题 1：一门非法课程让整表停止渲染

如果布局直接使用 `cols[c.day - 1]`，`day: 6` 会得到 `undefined`，继续读写就可能抛出异常。异常发生在循环中时，后续表格生成也会停止。

先记录实际报错，不要把所有白屏都归因于这个字段：

```text
操作：在 data.js 增加 day: 6 的课程并刷新
期望：非法课程被跳过并警告，其他课程正常
实际：表格没有更新，Console 报 Cannot read properties of undefined
最近改动：只增加了这一条课程记录
```

本版只支持周一至周五，正确预期不是“显示周六”，而是“跳过并警告”。修复方式是在冲突检测和布局之前调用 `validCourse`，同时检查整数、字段枚举和 `start + span - 1 <= PERIODS`。

合法加课和非法数据容错是两项测试。新增合法课程用于验收第 8 条；故意设置 `day: 6` 用于检查容错，不能互相替代。

## 问题 2：`skip` 多输出一个格子

错误代码：

```js
if (cell === 'skip') {
  html += '<td class="empty"></td>';
  continue;
}
```

上一行的课程格已经通过 `rowspan` 占用了当前位置，这里又多输出一个 `<td>`，后续内容通常会向右错位，甚至出现额外列。正确写法仍然是不输出任何内容：

```js
if (cell === 'skip') continue;
```

定位时先看 Elements 中跨行单元格的位置，再检查当前行是否在预留位置之外多输出了 `td`。不要机械地数“每行必须有六个 td”，因为正确使用 `rowspan` 的行本来就会少一些单元格。

<Quiz
  q="哪个信号最能直接定位这个 skip 问题？"
  a="页面颜色看起来不统一"
  b="上一行 rowspan 已占用位置，当前行仍多输出一个 td"
  c="课程名称里有一个错别字"
  d="刷新后样式可能变化"
  correct="b"
  why="skip 表示该位置已被上方单元格占用。多输出 td 会破坏列对齐，应在 Elements 中对照 rowspan 和实际单元格。其他选项与这个结构问题无直接关系。"
/>

## 问题 3：单双周显示反了

常见原因是周次内部从 0 开始，却按从 1 开始的规则计算 `% 2`，或者直接把 `odd` 的判断写反。统一使用从 1 开始的周次，并集中到一个函数：

```js
function matchesWeek(c, week) {
  if (c.weeks === 'odd') return week % 2 === 1;
  if (c.weeks === 'even') return week % 2 === 0;
  return true;
}
```

不要只看当前格“有一门课”就通过，要筛选同一时间格的两门互补课程：

```js
const slot = COURSES.filter((c) => c.day === 3 && c.start === 1);
console.table([1, 2].map((week) => ({
  week,
  courses: slot.filter((c) => matchesWeek(c, week)).map((c) => c.name).join('、'),
})));
```

第 1 周应只有线性代数，第 2 周应只有大学物理。这样不会把其他周的课程混进检查结果。

## 问题 4：每周课和单周课重叠，却没有警告

标题和症状要与错误代码对应。下面这段代码的问题是“只要周次字符串不同，就判为不冲突”：

```js
if (a.weeks !== b.weeks) return false;
```

它确实能排除 `odd` 和 `even`，却也会错误排除 `all` 和 `odd`。每周都有的一门课，与单周课在单周当然会重叠。

正确条件是只有两门都限定单双周、且类型不同时，才没有周次交集：

```js
if (a.weeks !== 'all' && b.weeks !== 'all' && a.weeks !== b.weeks) return false;
```

可以临时添加同时间的一门 `all` 和一门 `odd` 课程验证。它们应产生一对冲突；改成 `odd` 和 `even` 后不应冲突。测试完恢复基准数据。

## 记录和恢复

每项测试只改一处，验完恢复基准数据，避免多个测试改动叠加。`BUGS.md` 可以写：

```markdown
- 非法 day：校验在布局之前执行，非法课程警告并跳过。
- 表格右移：skip 多输出 td，改为直接 continue。
- 单双周反了：统一从 1 开始的周次和 matchesWeek。
- all / odd 漏报：只有 odd / even 互补时才排除冲突。
```

需要放弃未提交修改时，先运行 `git status` 和 `git diff`。`git restore .` 不会删除未跟踪的新文件，也不会默认清除已暂存改动。要回到更早的已提交版本，参照 [调试流程](/loop/fix/) 从好提交新建分支，不要直接硬重置含有未保存工作的分支。

功能通过后进入 [交付](/case-schedule/ship/)。
