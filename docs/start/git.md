---
title: 装 Git，学会三个命令
icon: vscode-icons:file-type-git
permalink: /start/git/
createTime: 2026/10/28 09:51:09
---

先说它解决什么问题。

你让 AI 改一个功能，它改了 200 行，跑不起来了。你想回到"刚才还能跑"的状态，但没有"刚才"。于是你只能让它"再修一下"，然后它又改了 150 行。半小时后，你已经不知道自己在哪个版本上。

Git 就是**游戏存档**。它不是给团队协作用的，第一周它是给你自己用的。

## 装

:::: steps

1. **Windows**

   去 [git-scm.com](https://git-scm.com/) 下载 64-bit 安装包。一路「下一步」，只有一处在问到默认编辑器时，选 **Use Visual Studio Code as Git's default editor**（方便），其余全是默认值。

2. **macOS**

   打开终端（`Cmd+空格`，输入 Terminal），敲：

   ```bash
   xcode-select --install
   ```

   弹窗点「安装」，等五分钟。也可以用 `brew install git`。

3. **验证**

   ```bash
   git --version
   ```

   看到 `git version 2.x.x` 就成了。第一次用如果提示要安装命令行工具，同意即可。

::::

## 配置身份（只做一次）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

这不重要，但必须做，否则提交会报错。名字随便写，邮箱写真的（以后注册 GitHub 用得上）。

顺手改掉一个默认行为，否则以后合代码会莫名多出一个 merge 提交：

```bash
git config --global pull.rebase true
```

## 心智模型：三个抽屉

```mermaid
flowchart LR
  A["工作区<br/>你眼前的文件"] -->|git add| B["暂存区<br/>这次要提交的东西"]
  B -->|git commit| C["仓库<br/>一个快照，永远回得去"]
  C -->|git restore| A
```

- **工作区**：你正在编辑的文件，随改随变
- **暂存区**：你挑出来"这次要存档"的改动
- **仓库**：一个个快照，每个快照有一段说明和一条时间线

大部分时候你只需要 `add` 和 `commit`。`add` 是在挑，`commit` 是在拍快照。

## 五个命令够用

```bash
git init                      # 第一次：把这个文件夹变成仓库
git status                    # 随时：现在有什么改动
git add .                     # 把当前所有改动挑进暂存区
git commit -m "能跑的第一版"   # 拍快照，写一句人话
git log --oneline             # 看看存档列表
```

两个补充：

```bash
git diff                      # 看你还没 add 的改动到底改了哪几行
git restore .                 # 丢掉所有未提交的改动（回到上一个快照）
```

::: danger `git restore .` 是熔断器
它会**真的删掉**你还没提交的改动，救不回来。用之前先 `git status` 看清楚，或者先 `git add .` 再 restore（进了暂存区的东西 restore 会保留在暂存区）。

这是这份指南里唯一一个会毁掉你工作的命令。别慌，但要记住它很硬。
:::

## `.gitignore`：第一条就写它

在项目根目录建一个文件，名字就叫 `.gitignore`，内容：

```text
node_modules/
.env
*.log
.DS_Store
```

为什么第一条是 `node_modules`：那个文件夹有几万个文件，提交进去会让仓库变成几十 MB，`git status` 卡半分钟，而且它本来就可以用 `npm install` 重新生成。

为什么第二条是 `.env`：那是你放 API key 的地方。**提交一次，这个 key 就等于公开了**——GitHub 上有专门的机器人在扫。见 [安全](/craft/safety/)。

## 什么时候提交

规则只有一条：**在"能跑"的状态下提交。**

- 功能跑通了 → 提交
- 修好一个 bug → 提交
- 让 AI 大改之前 → 先提交（这一条最救命）
- 深夜准备收工 → 提交

不要等写完整个项目才提交。一个下午应该有 5–15 个快照。

commit message 写人话就行，中文没问题：

```text
加倒计时功能和开始按钮
修：刷新后计时归零
样式：按钮改成圆角
```

将来你回头看 `git log`，这些句子就是你的项目日志。

## 在 VS Code 里用

`Ctrl+Shift+G` 打开源代码管理面板，你会看到：

- **改动列表**——每个改过的文件一行
- 点文件 → 左右对比视图，红的是删掉的，绿的是新增的
- 顶部输入框写说明，点 ✓ 就是 commit

::: tip 这个面板是审 AI 代码的主力工具
AI 说"改好了"的时候，先来这里看一眼。红绿对比里如果出现你没让它改的地方——那通常是它顺手"优化"的，也可能是它搞坏的地方。

**养成习惯：它说改好了 → 你点开 diff → 你才知道发生了什么。**
:::

## 要不要注册 GitHub

第一周可以先不注册。本地 Git 完全够用，它能保住你不丢工作。

但两天后你需要它：换电脑要带走项目、想发给别人看、想部署到公网上（案例二会用到 GitHub Pages）。

那时候：去 [github.com](https://github.com/) 注册一个账号，装 [GitHub Desktop](https://desktop.github.com/)（图形化，不用背命令），或者装 `gh` 命令行工具。注册用户名叫得像个人（`zhangsan-2026`），别用 `asdf123456`，因为这是你以后简历上会写的东西。

## 验收

```bash
mkdir vibe-git-test && cd vibe-git-test
git init
echo "第一版" > readme.md
git add .
git commit -m "第一个快照"
echo "第二版" >> readme.md
git status          # 应该看到 readme.md 被修改
git diff            # 应该看到你加的那一行是绿色的
git restore .
cat readme.md       # 回到"第一版"，第二行没了
```

最后一步如果内容回到了「第一版」，说明你理解了存档。这个动作你后面会做上百次。

::: tip 下一步
三个东西齐了：编辑器、Agent（下一步）、存档。去 [环境验收](/start/ready/) 打个勾，然后开工。
:::
