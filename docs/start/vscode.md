---
title: 装 VS Code
icon: vscode-icons:file-type-vscode
permalink: /start/vscode/
createTime: 2026/10/28 09:50:47
---

这份指南会用 VS Code 管理项目文件、查看代码差异、运行终端命令，也可以在里面使用编程 Agent。安装和基础设置通常需要二十分钟左右。

## 为什么是 VS Code

它免费，支持 Windows、macOS 和 Linux，相关教程也多。文件树、编辑器和终端可以放在同一个窗口里，刚开始做项目时比较容易看清各部分的关系。许多编程 Agent 提供 VS Code 扩展；终端类 Agent 也能直接使用它的内置终端。

其他编辑器同样可以完成本指南的练习，不必为了跟教程一致更换已经熟悉的工具。

## 下载和安装

打开 [code.visualstudio.com/download](https://code.visualstudio.com/download)，下载适合你系统的安装包。不要从来源不明的软件站下载。下面只看自己使用的系统即可。

![VS Code 官网下载页面](/images/start/vscode-download.png)

:::::: tabs

@tab Windows

::::: steps

1. **运行安装包**

   运行安装包时，建议勾上：

   - [x] 将「通过 Code 打开」操作添加到 Windows 资源管理器目录上下文菜单
   - [x] 将「通过 Code 打开」操作添加到 Windows 资源管理器文件上下文菜单
   - [x] 将 Code 注册为受支持的文件类型的编辑器
   - [x] 添加到 PATH（重启后生效）

   如果最后一项没勾，终端里的 `code .` 可能提示找不到命令。

2. **完成安装**

   启动 VS Code，能看到欢迎页即可。安装后新开的终端才能读取更新的 PATH。

:::::

@tab macOS

::::: steps

1. **选择对应芯片架构的安装包**

   打开官网下载页时注意芯片区分：
   - 搭载 M1 / M2 / M3 / M4 等 Apple 芯片的 Mac，下载 **Apple Silicon** 版本。
   - 早期搭载 Intel 处理器的 Mac，下载 **Intel** 版本。
   - 如果不确定，点击屏幕左上角苹果图标，选择“关于本机”查看处理器或芯片信息。

2. **移动到「应用程序」目录**

   下载得到 `.zip` 文件，双击解压出 `Visual Studio Code.app`。必须将其直接拖入访达的「应用程序」目录（`/Applications`）。

   ::: caution 不要留在下载文件夹直接运行
   如果直接在「下载」文件夹中双击运行，后续软件自动更新会失败，且终端注入的命令路径也会在清理临时文件后失效。
   :::

3. **配置终端 `code` 命令**

   打开安装好的 VS Code，按快捷键 `Cmd+Shift+P` 调出命令面板，输入 `shell command`，选择：

   **Shell Command: Install 'code' command in PATH**

   系统弹出提权弹窗时输入开机密码确认。完成后彻底关闭终端窗口并重新打开，输入 `code --version` 验证是否输出版本信息。

4. **遇到安全阻拦时的处理**

   若首次打开提示“无法打开，因为 Apple 无法检查其是否包含恶意软件”：
   - 打开“系统设置 → 隐私与安全性”，页面向下滑动找到“安全性”，点击“仍要打开”。
   - 或者在终端中直接移除下载隔离属性：
     ```bash
     xattr -d com.apple.quarantine /Applications/Visual\ Studio\ Code.app
     ```

:::::

::: tip 使用 Homebrew 安装
如果本机已配置 Homebrew，可以在终端直接执行一行命令完成下载与 PATH 关联：

```bash
brew install --cask visual-studio-code
```
:::

@tab Linux

::::: steps

1. **安装对应的软件包**

   - **Debian / Ubuntu 系列**：从官网下载 `.deb` 包后在终端运行：
     ```bash
     sudo dpkg -i code_*_amd64.deb
     sudo apt install -f   # 自动补齐缺失依赖
     ```
   - **Fedora / openSUSE 系列**：从官网下载 `.rpm` 包后在终端运行：
     ```bash
     sudo dnf install ./code-*.rpm
     ```
   - **Arch Linux 系列**：在终端直接运行：
     ```bash
     sudo pacman -S code
     ```

2. **验证终端命令**

   安装完成后，在终端运行以下命令：

   ```bash
   code --version
   ```

   终端打印出版本号即表示命令已可用。进入项目文件夹后运行 `code .`，即可直接在该目录下启动 VS Code。

:::::

::::::

### 中文语言包

按 `Ctrl+Shift+X`（macOS 是 `Cmd+Shift+X`）打开扩展面板，搜索 `Chinese (Simplified)`，认准发布者 Microsoft，点 Install，然后重启。

![在扩展面板中搜索并安装中文语言包](/images/start/vscode-chinese-ext.png)

版本会不断更新，只要仍受官方支持，就不必为了教程追某一个版本号。

## 用「打开文件夹」打开项目

做项目时选择 `文件 → 打开文件夹`（`Ctrl+K Ctrl+O`），打开项目的根目录。这样文件树、项目说明、Git 和 Agent 都能围绕同一组文件工作。

只打开单个 `index.html` 适合临时查看，但 Agent 未必会自动读取旁边的 `style.css` 和 `script.js`，你也难以看到整个项目的改动。

例如番茄钟项目的文件树可以是：

:::: file-tree

- pomodoro
  - index.html
  - REQUIREMENT.md
  - TODO.md

::::

这里打开的是 `pomodoro`，不是它上层的练习目录，也不是单独打开 `index.html`。

::: tip 项目路径尽量简单
VS Code、Node.js 等现代工具通常支持中文和空格路径，但少数旧脚本或插件可能处理不好。初学项目可以优先使用 `C:\dev\vibe-lab`、`D:\code\timer` 或 `~/dev/vibe-lab` 这样的简单路径，减少一类兼容性问题。
:::

## 常用的四个区域

| 区域 | 怎么打开 | 用来干什么 |
| --- | --- | --- |
| 资源管理器 | `Ctrl+Shift+E` | 查看项目文件，新建、重命名、删除 |
| 编辑器 | 点文件 | 阅读和小范围修改代码 |
| 终端 | `` Ctrl+` `` | 启动项目、安装依赖、使用 Git 和 Agent |
| 源代码管理 | `Ctrl+Shift+G` | 查看 diff、暂存和提交 |

![VS Code 常用四个区域全景工作界面](/images/start/vscode-four-areas.png)

代码不必全部手敲，但你要能在编辑器里改一个按钮文字、修正一个变量名，再重新运行验证。终端也很重要，安装依赖和启动项目都会用到它。

## 八个常用快捷键

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl+P` | 按文件名跳转 |
| `Ctrl+Shift+F` | 在整个项目里搜索文字 |
| `` Ctrl+` `` | 开关终端 |
| `Ctrl+B` | 收起或展开左边栏 |
| `Ctrl+/` | 注释或取消注释当前行 |
| `Shift+Alt+↓` | 向下复制当前行 |
| `Ctrl+Shift+K` | 删除当前行 |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 撤销 / 重做 |

macOS 上，大多数 `Ctrl` 快捷键改成 `Cmd`，`Alt` 改成 `Option`。开关终端通常仍是 `` Ctrl+` ``；也可以在菜单里选择「终端 → 新建终端」。

## 三个插件就够开始

按 `Ctrl+Shift+X` 打开扩展面板：

1. **Chinese (Simplified) Language Pack**：前面已经装过可跳过。
2. **Live Server**：右键 HTML 文件，选择 Open with Live Server；保存后浏览器会自动刷新。
3. **Error Lens**：把错误信息显示在对应代码行附近，可按需安装。

AI 编程插件先只启用一个，避免多个工具同时补全或弹出面板。格式化扩展也按语言需要安装，不必一次装一组功能重复的工具。

## 验收

1. 在 `C:\dev`（Windows）或 `~/dev`（macOS / Linux）下新建 `vibe-lab`，用 VS Code 打开它。
2. 新建 `hello.html`，写入 `<h1>能跑</h1>` 并保存。
3. 双击这个文件，浏览器里应出现“能跑”。
4. 在 VS Code 内置终端运行 `code .`，应重新打开当前文件夹。

如果 `code .` 提示找不到命令，Windows 可重新运行安装包并勾选 PATH，macOS 可再次执行 Install 'code' command in PATH。修改 PATH 后要重开终端。

:::: tip 下一步
编辑器可以用了，接着选一个编程 Agent，让它配合 VS Code 读写项目文件。点击下方「下一页」直接继续。
::::
