---
title: 装 VS Code
icon: vscode-icons:file-type-vscode
permalink: /start/vscode/
createTime: 2026/10/28 09:50:47
---

VS Code 是你在整份指南里待得最久的地方。它不是"代码编辑器"这么简单，它同时是你的**文件管理器**、**终端**、**差异对比工具**和**Agent 的落脚点**。

装它只需要十分钟。把它调成能用的样子，另外十分钟。

## 为什么是 VS Code

不是因为它最好，是因为它最不挑：

- 免费，Windows / macOS / Linux 都能装
- 几乎所有编程 Agent 都支持它（要么是扩展，要么是终端里跑命令，VS Code 自带终端）
- 左边文件树、右边代码、下面终端，三个窗口就把一个项目看全了
- 出问题时，你在网上搜到的截图基本都是它

JetBrains 全家桶更强，但要钱、要激活；Vim 更快，但你现在会花三天在退出方式上。先用它。

## 装

:::: steps

1. **下载**

   打开 [code.visualstudio.com](https://code.visualstudio.com/)，点中间那个大按钮。Windows 会自动识别你的系统；macOS 上会给你一个 `.zip`。

2. **安装（Windows）**

   运行安装包时，这几项务必勾上：

   - [x] 将「通过 Code 打开」操作添加到 Windows 资源管理器目录上下文菜单
   - [x] 将「通过 Code 打开」操作添加到 Windows 资源管理器文件上下文菜单
   - [x] 将 Code 注册为受支持的文件类型的编辑器
   - [x] 添加到 PATH（重启后生效）

   最后一项没勾，你在终端里敲 `code .` 会提示找不到命令。

3. **安装（macOS）**

   解压后把 `Visual Studio Code.app` 拖进「应用程序」文件夹。第一次打开会弹「无法验证开发者」，去 `系统设置 → 隐私与安全性` 点「仍要打开」。

   想在终端里用 `code .`：打开 VS Code，按 `Cmd+Shift+P`，输入 `shell command`，选 **Shell Command: Install 'code' command in PATH**。

4. **装中文界面（可选，但建议）**

   按 `Ctrl+Shift+X`（macOS 是 `Cmd+Shift+X`）打开扩展面板，搜索 `Chinese (Simplified)`，认准微软官方那个（发布者是 Microsoft），点 Install，然后重启。

5. **确认版本**

   按 `Ctrl+Shift+P` 打开命令面板，输入 `About`，看版本号。2026 年的版本都行，不用追最新。

::::

## 装完必须改的五个设置

按 `Ctrl+,` 打开设置，右上角有个「打开设置 (JSON)」的小图标，点它，把下面这段粘进去。每一项后面我写了为什么。

```json
{
  "files.autoSave": "onFocusChange",
  "editor.formatOnSave": true,
  "editor.fontSize": 15,
  "editor.minimap.enabled": false,
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true
  }
}
```

| 设置 | 为什么 |
| --- | --- |
| `autoSave: onFocusChange` | 切走就保存。Agent 改文件时你在浏览器里看，回来就是最新的。 |
| `formatOnSave: true` | 保存时自动缩进对齐。**这会让 diff 更好读**，后面审代码全靠它。 |
| `fontSize: 15` | 14 太小，16 太挤。眼睛会疼。 |
| `minimap: false` | 右边那条缩略图对新项目毫无用处，还占地方。 |
| `files.exclude` | 不显示 `node_modules`。那个文件夹里可能有几万个文件，展开一次能卡你半分钟。 |

::: tip 一个隐藏的坑
Windows 上，**项目文件夹的路径里不要有中文和空格**。`C:\Users\张三\Desktop\我的项目` 这种路径，会让某些命令行工具直接报错，而报错信息通常不会告诉你是路径的锅。

改成 `C:\dev\vibe-lab` 或者 `D:\code\timer`。就这一条，能省掉你两小时。
:::

## 打开项目：一个动作决定后面顺不顺

**永远用「打开文件夹」，不要用「打开文件」。**

```text
文件 → 打开文件夹（Ctrl+K Ctrl+O）
```

为什么？因为 Agent 需要知道"这个项目的边界在哪"。你打开单个 `index.html` 的时候，它看不到旁边的 `style.css`，也找不到项目里的说明文档，只能瞎猜。

正确的样子：左边资源管理器里是一个文件夹，文件夹里是这个项目的全部内容。

::: file-tree

- vibe-lab
  - timer
    - index.html
    - style.css
    - script.js
  - notes.md

:::

## 你只会用到四个区域

| 区域 | 怎么打开 | 用来干什么 |
| --- | --- | --- |
| 资源管理器 | `Ctrl+Shift+E` | 看项目里有哪些文件，新建、重命名、删除 |
| 编辑器 | 点文件 | 看代码。**用来看，不是用来一行行敲** |
| 终端 | `` Ctrl+` `` | 跑命令：启动项目、装依赖、用 Git |
| 源代码管理 | `Ctrl+Shift+G` | 看这次改了什么，提交 |

终端是重点。很多人装了 VS Code 之后从来不开终端，于是所有需要命令行的操作（装依赖、跑项目、用 Agent）都卡住。**先把 `Ctrl+`` ` `` 记住**。

## 八个快捷键，够你用一学期

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl+P` | 按文件名跳转。比在左边树里翻快十倍 |
| `Ctrl+Shift+F` | 全项目搜索文字。想知道某个词哪来的，用它 |
| `` Ctrl+` `` | 开关终端 |
| `Ctrl+B` | 收起/展开左边栏，屏幕小的时候很有用 |
| `Ctrl+/` | 注释/取消注释当前行 |
| `Shift+Alt+↓` | 向下复制当前行 |
| `Ctrl+Shift+K` | 删除当前行（不用先选中） |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 撤销 / 重做。**改坏了先按这个，别急着让 AI 修** |

macOS 上把 `Ctrl` 换成 `Cmd`，`Alt` 换成 `Option`。

## 三个插件，别多装

`Ctrl+Shift+X` 打开扩展面板：

1. **Chinese (Simplified) Language Pack** — 微软官方，界面中文化
2. **Live Server** — 右键 HTML 文件 → Open with Live Server，改完保存浏览器自动刷新。单文件项目用它，很爽
3. **Error Lens**（可选）— 把错误信息直接显示在出错那行的行尾，不用把鼠标移上去

::: warning 不要装的东西
- 各种"AI 编程"插件**只装一个**。同时装三个，它们会互相抢焦点、重复补全，你会以为是自己写错了
- 主题插件一个就够，装十个只会让你每次打开都在调颜色
- 不要装"代码美化全家桶"。`formatOnSave` 已经够了

插件装多了会明显拖慢启动。你现在需要的是**少而稳**。
:::

## 验收

做一遍下面三件事，全过了才继续：

1. 在桌面新建一个文件夹 `vibe-lab`，用 VS Code「打开文件夹」打开它
2. 在里面新建 `hello.html`，写入 `<h1>能跑</h1>`，保存
3. 双击这个文件，浏览器里出现「能跑」；然后在终端里敲 `code .`，VS Code 重新打开这个文件夹

第 3 步的 `code .` 如果提示找不到命令，回到「安装」那一步，Windows 重装时勾上 PATH，macOS 执行一次 Install 'code' command in PATH。

::: tip 下一步
编辑器有了。接下来装那个替你打字的家伙：[选一个编程 Agent](/start/agent/)。
:::
