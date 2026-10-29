---
title: 第三步：生成并运行
icon: carbon:play-filled
permalink: /case-schedule/build/
createTime: 2026/10/28 10:20:00
---

计划已经锁定为三个独立任务。在五步循环中，**第三步的铁律依然是「单任务推进」**：每次只派发一个任务，做完停下来，肉眼审查 diff、在真实浏览器中运行验收，通过后再推进下一项。

本节我们将实际跑通前两项任务：任务一（纯静态表格骨架）与任务二（数据接入、动态切周与 `rowspan` 跨节合并）。

## 任务一：骨架搭建与基础网格

### 1. 派发单任务指令

严格限制 Agent 活动范围，禁止提前写入数据与冲突逻辑：

```text title="任务一派发提示词"
严格只实现【任务一：骨架搭建与基础网格】：
- 创建 index.html，包含周次切换栏、5列6行基础表格、空网格样式与响应式布局。
- 绝不要接入 COURSES 数据渲染！绝不要做冲突检测！
- 页面先保持纯静态表格骨架与基础周次切换计数（纯内存 1-20，不用 localStorage）。
- 完成后在终端输出预览和验收步骤，等待我验收。
```

### 2. 审查与越界自检

Agent 生成了极简的单文件 `index.html`（251 行）。我们审查代码时确认：
1. **零越界**：全文检索 `COURSES`、`localStorage`、`conflict`、`rowspan`，出现次数全部为 **0**。
2. **结构完整**：包含顶部切周栏（按钮 + 第 N 周文案）、隐藏的警告栏占位、以及原生 5×6 带有 `data-day` 与 `data-period` 的空表格。
3. **响应式自适应**：容器使用 `overflow-x: auto`，表格设置 `min-width: 640px` 与 `table-layout: fixed`，窗口拖窄时不塌陷、出现横向滚动条。

### 3. 首屏直测效果

在真实浏览器中打开，空网格与周次切换栏渲染如下：

![任务一：纯静态课表空网格与切周栏](/images/case-schedule/task1-preview.png)

手动点击上一周/下一周，数字在 1–20 之间平稳递增递减，到头自动禁用按钮，刷新页面平稳回到第 1 周。

### 4. 任务一打卡提交

验收通过后，在终端执行 Git 提交：

```bash title="任务一提交日志"
💻 [Bash]:
$ cd /home/yoake/Code/schedule && git add index.html && git commit -m "feat: 完成课表骨架搭建与基础网格"

📋 [Result]:
[main 7446120] feat: 完成课表骨架搭建与基础网格
 1 file changed, 251 insertions(+)
 create mode 100644 index.html
```

---

## 任务二：课程数据接入与动态渲染

### 1. 派发任务二指令

骨架与列宽已经锁定，现在让 Agent 注入课程数据与 `rowspan` 合并算法：

```text title="任务二派发提示词"
任务一验收通过，骨架与响应式表现非常规整。

请执行【任务二：课程数据接入与动态渲染】：
- 在 index.html 中注入 REQUIREMENTS.md 定义的 8 门 COURSES 常量数据。
- 实现渲染逻辑：根据当前周次（1-20）过滤出当周有效课程（all / odd / even）。
- 实现跨节合并：连续跨多节（span > 1）的课程在表格中合并为一个单元格展示，并正确处理被合并节次的单元格占位，保证表格列宽与对齐不破版。
- 切换上一周/下一周时自动重新渲染课程。
- 先不要做冲突判定与警告栏（那是任务三），先不要做 localStorage 持久化。
- 完成后在终端输出验收建议与快速验证方法。
```

### 2. 核心算法：单元格占位与 rowspan 防错位

在 HTML 表格中，`rowspan="2"` 会将单元格纵向扩展到下一行。如果下一行仍然输出对应位置的 `<td>`，整行表格就会被硬生生挤出 1 格，导致整体破版！

Agent 采取的占位矩阵算法如下：

:::: code-tabs

@tab 占位跳过算法

```js
// 构建 5 天 × 6 节的占位网格
const grid = Array.from({ length: 5 }, () => Array(6).fill(null));

for (const course of activeCourses) {
  const d = course.day - 1;
  const s = course.start - 1;
  
  // 若已有课程占位（先到先占），暂不放入网格，保留结构完整
  if (grid[d][s] !== null) continue;

  grid[d][s] = { course, span: course.span };
  // 被 rowspan 吞并的后续节次，标记为 "skip"
  for (let k = 1; k < course.span; k++) {
    if (s + k < 6) grid[d][s + k] = "skip";
  }
}
```

@tab 渲染分支处理

```js
for (let p = 0; p < 6; p++) {
  tbodyHtml += `<tr><th class="col-period">第 ${p + 1} 节</th>`;
  for (let d = 0; d < 5; d++) {
    const cell = grid[d][p];
    if (cell === "skip") continue; // 关键：被上一节 rowspan 覆盖的位置不输出 td！
    if (cell) {
      tbodyHtml += `<td rowspan="${cell.span}">${renderCard(cell.course)}</td>`;
    } else {
      tbodyHtml += `<td></td>`;
    }
  }
  tbodyHtml += `</tr>`;
}
```

::::

### 3. 验收与实测对比

渲染完成后在浏览器中直测，6 行中每行的单元格数加上跨行占位恒等于 6（1 个行头 + 5 列），毫无错位：

![任务二：课程数据渲染与单双周交替展示](/images/case-schedule/task2-preview.png)

手动验证两个核心场景：
* **单双周切换**：第 1 周（单周）周五 1–2 节显示「操作系统」；点击下一周切到第 2 周（双周），周五 1–2 节无缝切换为「计算机网络」，操作系统消失。
* **重叠保护**：周三第 1–2 节安排了「大学英语」与「编译原理」，表格优先渲染先录入的「大学英语」，并未发生单元格被撑爆换行。

### 4. 任务二打卡提交

```bash title="任务二提交日志"
💻 [Bash]:
$ cd /home/yoake/Code/schedule && git add index.html && git commit -m "feat: 实现课程数据渲染与跨节合并"

📋 [Result]:
[main a31b0fc] feat: 实现课程数据渲染与跨节合并
 1 file changed, 153 insertions(+), 54 deletions(-)
```

---

## 阶段总结

代码以原子级颗粒度推进到了第 4 个 Commit：

```text title="git log --oneline 提交历史"
a31b0fc (HEAD -> main) feat: 实现课程数据渲染与跨节合并
7446120 feat: 完成课表骨架搭建与基础网格
95dd8b9 docs: 建立三步实施计划
9240319 docs: 建立课程表最简需求卡
```

接下来，我们进入最有技术深度的第四步：实现两两冲突检测、红色警示标记、警告栏展开与 `localStorage` 越界容错。

[下一步：盯差量与修边界（任务三）](/case-schedule/debug/){.read-more}
