---
title: 第四步：盯差量与修边界
icon: carbon:debug
permalink: /case-timer/bug/
createTime: 2026/10/28 10:01:42
---

许多初学者在让 Agent 生成代码后，往往只在界面上“随便点两下”，看起来正常就认为搞定了。但软件工程中 80% 的隐蔽缺陷，都潜伏在**时区偏差、存储损坏、意外刷新和边界异常**中。

在五步循环的第四步，我们聚焦于检查代码差量（Git Diff）与处理边界异常。本节以【任务三：持久化与完成计数】为例，演示如何通过审查改动和针对性测试，确保数据存储和日期处理的可靠性。

## 派发任务三指令

```text title="任务三派发提示词"
请执行【任务三：持久化与完成计数】：
- 按照 TODO.md 任务三要求，在页面上渲染「今日完成：0 次」文本（保持极简低调排版）。
- 倒计时归零时完成数 +1，写入 localStorage（带当天日期 YYYY-MM-DD）。
- 页面载入时读取：跨天自动归零，JSON 损坏或写入受限静默降级为 0，不报错。
- 严禁持久化未跑完的倒计时进度（刷新页面仍回到 25:00 静止态）。
- 实现后，在终端给出验收建议。
```

## 盯差量：通过 Git Diff 审查核心变更

代码生成后，**先不要急着看页面，在终端输入 `git diff` 审查代码变更**：

:::: code-tabs

@tab 本地时区计算（防 UTC 偏差）

```js
// 避免使用 toISOString()，因为 UTC 时间在东八区早晨会导致日期仍算在“昨天”
function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}
```

@tab 三重容错读取（静默降级）

```js
// 无论遇到损坏的 JSON、非法类型还是存储被禁用，一律静默兜底为 0，绝不抛错白屏
function loadCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const saved = JSON.parse(raw);
    if (!saved || saved.date !== todayKey()) return 0; // 跨天自动归零
    const count = Number(saved.count);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch (error) {
    return 0; // 静默降级
  }
}
```

@tab 写入保护与零进度污染

```js
// 隐私无痕模式下 localStorage.setItem 会抛异常，catch 后保证内存中计数依然可用
function saveCount() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      date: todayKey(), 
      count: completedCount 
    }));
  } catch (error) {
    /* 静默忽略，不阻断主流程 */
  }
}

// 严禁持久化 remaining 秒数！页面载入永远回 25:00
```

::::

## 深度防御检查清单

通过这次 Diff 审查，我们确认了三个关键防御设计：

:::: card title="健壮性设计要点"
1. **时区一致性**：使用 `getFullYear() / getMonth() / getDate()` 获取用户设备本地时间，防止使用 `toISOString()` 导致东八区凌晨日期算错一天。
2. **三层存储熔断**：`getItem` 异常、`JSON.parse` 解析失败、非法非数结构，一律兜底返回 `0`，避免控制台报错阻断页面其他逻辑。
3. **零进度污染**：倒计时剩余时间 `remaining` 绝不写入存储，用户关闭或刷新页面时，绝不会出现“卡在 17:34 的残缺计时”。
::::

## 破坏性边界测试（实测）

Agent 对任务三执行了严苛的破坏性测试矩阵：

| 破坏性操作 | 注入方式 | 预期表现 | 实际表现 |
| --- | --- | --- | --- |
| **跨天模拟** | DevTools 将 `date` 改为昨天 `2020-01-01`，刷新页面 | 计数自动归零，不抛错 | ✅ 计数显示 0 次 |
| **存储投毒** | 在 localStorage 写入非法语法 `{not json`，刷新页面 | 容错降级，控制台 0 报错 | ✅ 计数显示 0 次，0 报错 |
| **意外刷新** | 倒计时跑到 `24:58` 强制刷新页面 | 计时回 25:00，已完成计数不丢 | ✅ 时间回 25:00，计数保留 |
| **多轮累加** | 跑完 2 轮 3 秒测试 | 计数准确累加为 2，存储正确更新 | ✅ 计数为 2 |

最终完成态视觉呈现：

![任务三最终完成态（大字号 + 状态机 + 今日完成数）](/images/case-timer/task3-final.png)

## 提交任务三

测试验证通过后，提交任务三代码：

```bash title="任务三提交日志"
💻 [Bash]:
$ cd /home/yoake/Code/pomodoro && git add index.html && git commit -m "feat: 完成今日完成数持久化与跨天重置"

📋 [Result]:
[main 182358b] feat: 完成今日完成数持久化与跨天重置
 1 file changed, 49 insertions(+), 1 deletion(-)
```

代码已全部就绪。点击下方「下一页」，进入最后一步的全量验收与工程清理。
