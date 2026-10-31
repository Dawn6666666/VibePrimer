---
title: 第四步：盯差量与修边界
icon: carbon:debug
permalink: /case-timer/bug/
createTime: 2026/10/28 10:01:42
---

Agent 生成代码后，不要只在界面上随便点两下就认为完成了。有些问题在普通点击时不容易发现，比如时区算错导致跨天不归零、浏览器存储被禁用、或者数据损坏导致脚本报错。

第四步的核心是检查代码改动（Git Diff）并处理边界情况。本节以【任务三：持久化与完成计数】为例，演示如何审查改动，并通过几项针对性测试确保功能稳定。

## 派发任务三指令

```text title="任务三派发提示词"
请执行【任务三：持久化与完成计数】：
- 按照 TODO.md 任务三要求，在页面上渲染「今日完成：0 次」文本（保持极简低调排版）。
- 倒计时归零时完成数 +1，写入 localStorage（带当天日期 YYYY-MM-DD）。
- 页面载入时读取：跨天自动归零，JSON 损坏或写入受限时兜底为 0，不报错。
- 严禁持久化未跑完的倒计时进度（刷新页面仍回到 25:00 静止态）。
- 实现后，在终端给出验收建议。
```

## 审查代码变更

代码生成后，**先不要急着刷新页面，在终端运行 `git diff` 检查改动**：

:::: code-tabs

@tab 本地日期计算

```js
// 使用本地时间，避免使用 toISOString() 导致东八区早晨日期算成昨天
function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}
```

@tab 读取数据时的容错

```js
// 遇到损坏数据或存储被禁用时，兜底返回 0，避免页面报错中断
function loadCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const saved = JSON.parse(raw);
    if (!saved || saved.date !== todayKey()) return 0; // 跨天自动归零
    const count = Number(saved.count);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch (error) {
    return 0; // 出现异常时安全返回 0
  }
}
```

@tab 写入保护与状态隔离

```js
// 隐私无痕模式下 setItem 可能抛出异常，加 try-catch 避免阻断其他逻辑
function saveCount() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      date: todayKey(), 
      count: completedCount 
    }));
  } catch (error) {
    // 忽略存储失败，不影响正在进行的计时
  }
}

// 倒计时剩余秒数不存入 localStorage，页面载入始终回到 25:00
```

::::

## 审查代码时的三个注意点

通过这次 Diff 审查，我们确认了三个关键处理：

:::: card title="检查要点"
1. **本地时区**：使用设备本地时间（`getFullYear / getMonth / getDate`），避免使用 `toISOString()` 导致东八区凌晨日期算错一天。
2. **异常兜底**：无论是 JSON 格式损坏还是存储受限，都安全返回默认值 `0`，避免控制台报错。
3. **不存多余状态**：倒计时剩余时间不存进浏览器，用户刷新或重新打开页面时，始终回到 `25:00` 开始。
::::

## 异常情况测试

代码写好后，我们在浏览器中手动模拟几种异常情况进行测试：

| 测试场景 | 操作方式 | 预期表现 | 实测结果 |
| --- | --- | --- | --- |
| **模拟跨天** | 在控制台将存储日期改为昨天 `2020-01-01`，刷新页面 | 计数自动归零，不报错 | ✅ 计数显示 0 次 |
| **损坏数据** | 在 localStorage 中手动写入错误数据 `{not json`，刷新页面 | 安全兜底，控制台无报错 | ✅ 计数显示 0 次，控制台 0 报错 |
| **中途刷新** | 倒计时跑到一半时直接刷新页面 | 计时重置为 25:00，已完成计数保留 | ✅ 时间回到 25:00，计数不丢失 |
| **连续完成** | 跑完 2 轮快速倒计时 | 计数准确累加为 2，存储正确更新 | ✅ 计数为 2 |

最终完成态视觉呈现：

![任务三最终完成态（大字号 + 状态机 + 今日完成数）](/images/case-timer/task3-final.png)

## 提交任务三

测试验证通过后，让 Agent 在终端中提交任务三代码：

:::: chat title="与 Agent 对话：提交任务三代码"

{.}
异常测试与跨天重置验证全部通过。请提交本次代码，提交信息为 "feat: 完成今日完成数持久化与跨天重置"。

{Agent}
已调用终端命令完成提交：

```bash
$ git add index.html && git commit -m "feat: 完成今日完成数持久化与跨天重置"
[main 182358b] feat: 完成今日完成数持久化与跨天重置
 1 file changed, 49 insertions(+), 1 deletion(-)
```
::::

代码已全部就绪。点击下方「下一页」，进入最后一步的全量验收与工程清理。
