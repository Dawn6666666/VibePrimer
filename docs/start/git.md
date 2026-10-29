---
title: 装 Git，学会存档和恢复
icon: vscode-icons:file-type-git
permalink: /start/git/
createTime: 2026/10/28 09:51:09
---

你让 AI 改一个功能，运行后发现结果不对。如果之前保存过一个可恢复的版本，就可以先回到那个状态，再小步修改。Git 用来记录这些版本，第一周先把它当作个人存档工具即可；以后团队协作还会继续用到它。

## 装

:::: tabs

@tab Windows

去 [git-scm.com](https://git-scm.com/) 下载适合电脑的安装包。询问默认编辑器时，可以选 **Use Visual Studio Code as Git's default editor**，其余选项先保留默认值。安装后重新打开终端，后面的命令练习可以选择随 Git 安装的 **Git Bash**。

@tab macOS

打开终端（`Cmd+空格`，输入 Terminal），运行：

```bash
xcode-select --install
```

按弹窗提示安装命令行工具。已经使用 Homebrew 的话，也可以运行 `brew install git`。

@tab Linux

Debian / Ubuntu 可以运行 `sudo apt update && sudo apt install git`。其他发行版使用各自的包管理器，或参考 [Git 官方安装说明](https://git-scm.com/downloads/linux)。

::::

三个系统安装完成后，都在新开的终端中验证：

```bash
git --version
```

看到 `git version 2.x.x` 就说明命令已经可用。

## 配置提交作者信息

```bash
git config --global user.name "你的名字或昵称"
git config --global user.email "你的邮箱"
```

这些信息会记录在每次提交里，用来标明作者，不等于 GitHub 登录凭证。使用 GitHub 时，也可以在账号设置里选择它提供的 `noreply` 邮箱，避免公开常用邮箱。

## 工作区、暂存区和仓库

```mermaid
flowchart LR
  A["工作区<br/>你眼前的文件"] -->|git add| B["暂存区<br/>准备提交的改动"]
  B -->|git commit| C["仓库<br/>提交历史中的快照"]
  B -->|git restore| A
```

- **工作区**：你正在编辑的文件
- **暂存区**：你挑选出来、准备放进下一次提交的改动
- **仓库**：项目在本地的提交历史，每次提交都有说明和编号

`git add` 选择改动，`git commit` 记录快照。新文件要先加入暂存区，才会进入提交。

## 常用命令

```bash title="Git 常用工作流命令" {3-4}
git init                       # 第一次：在当前项目文件夹初始化仓库
git status                     # 查看修改、暂存和未跟踪文件
git add .                      # 把当前目录下的改动加入暂存区
git commit -m "能跑的第一版"   # 记录一次快照
git log --oneline              # 查看提交列表
git diff                       # 查看尚未暂存的改动
git diff --staged              # 查看已经暂存的改动
```

`git restore .` 可以丢弃工作区里已跟踪文件的改动，默认按暂存区恢复。使用前要知道三个边界：

- 它不会删除新建但尚未跟踪的文件。
- 它默认不会丢弃已经暂存的改动。
- 被丢弃且没有其他地方保存的修改，通常很难找回。

:::: danger 恢复前先检查
先运行 `git status` 和 `git diff`，确认哪些内容会受影响。如果改动可能还有用，先复制备份，或者做一次标明 `WIP` 的临时提交。不要凭印象执行恢复命令。
::::

## 第一次提交前先写 `.gitignore`

在项目根目录建一个名为 `.gitignore` 的文件：

```text title=".gitignore"
node_modules/
.env
*.log
.DS_Store
```

`node_modules/` 是依赖目录，通常可以通过 `npm install` 重新生成，不必提交。`.env` 常用来保存 API key 等配置，默认也不要提交。已经被 Git 跟踪的文件不会仅因写进 `.gitignore` 就自动停止跟踪，所以要在第一次 `git add` 前检查。

密钥提交到本地仓库不等于已经公开，但推送到公开仓库后应立即按泄露处理。随后删除文件也不够，因为历史提交里可能仍有副本。具体处理见 [安全](/craft/safety/)。

## 什么时候提交

功能快照应在验证后提交：第一版能打开、一个按钮按预期工作、一个问题修复并通过复测，都是合适的时机。让 AI 做较大修改之前，也要先确认已有进度已保存。

未完成的工作可以做一次带 `WIP` 标记的临时提交，写明哪里还没做完。它用于保存进度，不应冒充已经验收的版本。

commit message 直接写本次变化，中文就可以：

```text
加倒计时和开始按钮
修复暂停后仍计时的问题
调整按钮样式
```

以后查看 `git log`，这些说明能帮助你找到需要的版本。

## 在 VS Code 里用

按 `Ctrl+Shift+G` 打开源代码管理面板。点击改动列表里的文件，可以看到左右对比，红色表示删除，绿色表示新增。

提交前先看 diff，再选择要暂存的文件，最后填写说明并提交。直接点提交按钮可能会把当前改动全部纳入，不要在不看内容的情况下顺手点过去。

:::: tip 用 diff 检查 Agent 的改动
Agent 说“改好了”之后，先看它实际改了哪些文件和代码。如果出现任务之外的修改，先问清原因，再决定是否保留。
::::

## 要不要注册 GitHub

第一周可以先不注册，本地 Git 就能保存提交历史。需要换电脑、分享项目或部署网页时，再注册 [GitHub](https://github.com/) 账号。

不熟悉远程仓库命令时，可以使用 [GitHub Desktop](https://desktop.github.com/)。它能完成克隆、提交和推送，界面也比纯命令行直观。案例二的部署篇会说明第一次推送需要哪些准备。

## 验收

下面的命令适用于 Windows 的 Git Bash，以及 macOS / Linux 终端。先进入一个专门用于测试的父目录，再执行：

```bash
mkdir vibe-git-test && cd vibe-git-test
git init
echo "第一版" > readme.md
git add .
git commit -m "第一个快照"
echo "第二版" >> readme.md
git status
git diff
git restore .
cat readme.md
```

最后应只看到“第一版”。再执行 `git status`，工作区应恢复干净。这个练习只修改了一个已跟踪文件，所以可以直接用 `git restore .`；真实项目仍要先检查暂存改动和新文件。

:::: tip 下一步
编辑器、Agent 与 Git 都准备好了，接着去环境验收逐项验证配合情况。点击下方「下一页」直接继续。
::::
