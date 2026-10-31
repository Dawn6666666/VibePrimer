---
title: 案例三 · 图书管理系统
icon: carbon:book
permalink: /case-bookhub/
createTime: 2026/10/31 16:30:00
---

在掌握了番茄钟（单文件极简工具）与课程表（带复杂状态与算法的前端工具）之后，本案例进入真实的工程实践场景：**在已有的完整前后端全栈项目上进行增量功能迭代与调试**。

现实中的开发工作，绝大多数并不是从零新建一个空页面，而是接手一套已经运行的代码库。本案例以 **BookHub 图书管理系统**（基于 Spring Boot 3 + MyBatis-Plus + MariaDB/MySQL + Vue 3 + Element Plus）为例，演示如何通过与 Agent 对话：
1. 快速读懂未知项目的架构分层与业务模型；
2. 跑通基准环境并避开端口冲突；
3. 通过清晰的需求描述与交互选择收敛技术方案；
4. 安全增加后端统计接口与前端 ECharts 图表，并适配现有设计风格；
5. 定位并解决真实开发中的时序渲染 Bug（Vue 过渡动画导致 Canvas 渲染为空）与缓存问题；
6. 严守管理员与普通用户的权限隔离边界，完成全流程回归验收。

## 先看改动效果

本轮迭代的目标是升级管理员首页：从原先仅有 3 张简易卡片的页面，扩展为一个包含**图书分类统计饼图**、**热门图书借阅 TOP5 榜单**与**借阅情况三态环形图**的综合数据概览看板。

### 改动前 vs 改动后

:::: card-grid cols="2"

<Card title="改动前 · 仅有 3 张基础卡片" icon="carbon:dashboard">

首页只显示图书总数、用户总数与借阅总数，且这三项数据是通过并发调用 3 次分页查询（`size=1` 取 `total`）凑出来的，信息密度低，没有分类与排行数据。

![改动前的管理员首页只有图书、用户与借阅 3 张简易卡片](/images/case-bookhub/bookhub-home-before.png)

</Card>

<Card title="改动后 · 综合数据看板" icon="carbon:chart-ring">

新增分类分布饼图、热门借阅 TOP5 榜单与借阅三态环形图，数据全部由后端聚合接口动态提供，色彩与排版严密契合项目原有的陶土橘与羊皮纸白设计系统。

![改动后的管理员首页：3 张核心卡片 + 分类统计饼图 + 热门图书 TOP5 + 借阅情况环形图](/images/case-bookhub/bookhub-home-after.png)

</Card>

::::

### 现有系统的其他业务模块

老项目迭代的大忌是“修了新功能，改坏了旧业务”。改动前必须清楚系统已有的主要功能与交互习惯：

:::: card-grid cols="2"

<Card title="图书管理模块" icon="carbon:notebook">

支持图书按分类查询、库存余量显示、新增与上下架编辑。

![图书管理模块](/images/case-bookhub/bookhub-module-books.png)

</Card>

<Card title="图书分类模块" icon="carbon:category">

支持图书分类的多级层级维护与书籍关联统计。

![图书分类模块](/images/case-bookhub/bookhub-module-categories.png)

</Card>

<Card title="借阅记录模块" icon="carbon:catalog">

记录借阅流水、归还时间与逾期高亮提醒。

![借阅记录模块](/images/case-bookhub/bookhub-module-borrows.png)

</Card>

<Card title="用户管理模块" icon="carbon:user">

维护管理员与普通读者账号、状态启停与密码重置。

![用户管理模块](/images/case-bookhub/bookhub-module-users.png)

</Card>

::::

---

## 与 Agent 的对话过程

在这个案例中，我们全程通过自然语言与 Agent 结对协作，完成架构摸底、启动项目、需求梳理、交互选型、接口落地、排查时序 Bug 以及多角色回归测试。

下面按顺序列出对话记录、如何向 Agent 表达指令，以及每个阶段的项目文件演进：

::::: timeline
- 步骤一 · 摸清家底：读懂已有架构与业务
  time="2026-10-31"

  - **怎么跟它说**：`简单介绍一下这个项目`
  - **确认的要点**：让 Agent 通读 `pom.xml`、`README.md`、`schema.sql`、controller 与 static 目录。明确这是前后端一体工程：后端采用 Spring Boot 3 + MyBatis-Plus，前端通过静态资源目录托管单文件 Vue 3 + Element Plus CDN；鉴权使用自定义 Token 拦截器配合 `ensureAdmin()` 守卫；主要业务实体为书籍、分类、借阅记录与用户。

  ::: file-tree
  - bookhub/
    - pom.xml # 后端依赖配置
    - README.md # 项目说明
    - 需求.md # 既有业务规范
    - src/main/java/org/example/bookhub/ # 后端源码（Controller / Service / Mapper / Domain）
    - src/main/resources/
      - application.properties # 数据库与初始化配置
      - schema.sql # 建表语句
      - data.sql # 预置测试数据
      - static/ # 前端单页应用
        - index.html # CDN 引入与挂载点
        - app.js # Vue 3 核心业务逻辑
        - styles.css # 陶土橘学术设计系统变量
  :::

- 步骤二 · 跑通基准：启动与验证基准环境
  time="2026-10-31"

  - **怎么跟它说**：`帮我跑起来这个项目`
  - **确认的要点**：检查数据库连通性（MariaDB/MySQL），确认自动执行建库与初始数据注入；排查网络端口冲突（发现默认的 8080 端口被本机其他未知进程占用，Agent 聪明地避开冲突改用 8081 端口启动应用）；通过 curl 验证登录接口，确认 `admin/123456` 与 `student/123456` 默认账号均可正常使用。

  ![启动前基准页面：改动前的管理员首页](/images/case-bookhub/bookhub-home-before.png)

- 步骤三 · 需求访谈与交互选型：三道关键选择题
  time="2026-10-31"

  - **怎么跟它说**：
    > 我想给 BookHub 图书管理系统的管理员首页增加一些数据统计和图表展示。  
    > 现在首页比较简单，只有图书总数、用户总数和借阅数量几个统计卡片。我希望让首页更加丰富一些。  
    > 具体想增加：  
    > 1. 图书分类统计，用饼图展示不同分类的图书数量。  
    > 2. 热门图书排行榜，展示借阅次数最多的 5 本书。  
    > 3. 借阅情况统计，展示正在借阅、已经归还和已经逾期的数量。  
    > 4. 保留现在的整体设计风格，让页面看起来简洁、美观。  
    > 统计数据尽量从现有数据库中获取，不要使用写死的假数据。  
    > 请先看看现有项目的代码，分析应该怎么实现，需要修改哪些地方。先不要着急写代码，等我确认方案后再开始。

  - **确认的要点**：
    - Agent 审查代码发现关键细节：数据库借阅表中只物理存储了「未归还」和「已归还」两种状态，而「逾期」需要根据 `due_time < NOW()` 动态判断。
    - 前端项目目前没有引入任何图表库，必须补充轻量 CDN。
    - 针对三处尚未确定的交互形式，Agent 主动通过交互选择向我们确认：

  ::: note 决策一：借阅情况统计用哪种形式展示？
  选项包括环形图、横向堆叠条形图与状态卡片。我们选择了**环形图**（直观呈现三态占比，中央显示借阅总数）。
  :::

  ![Agent 提问：借阅情况统计展示形式](/images/case-bookhub/bookhub-chat-question-layout.png)

  ::: note 决策二：热门图书 TOP5 排行榜用哪种形式？
  选项包括排名徽标榜单、条形对比图与紧凑表格。我们选择了**排名徽标榜单**（前三名带金色/银色编号徽标与借阅热度条，符合图书馆调性）。
  :::

  ![Agent 提问：热门图书 TOP5 形式](/images/case-bookhub/bookhub-chat-question-ranking.png)

  ::: note 决策三：图表库技术选型？
  考虑到项目使用原生 CDN 脚本引入，选项包括 ECharts 5、Chart.js 与纯手写 SVG。我们选择了生态成熟、主题可高度定制的 **ECharts 5 CDN**。
  :::

  ![Agent 提问：图表库选型](/images/case-bookhub/bookhub-chat-question-chartlib.png)

- 步骤四 · 制定实施计划与后端接口落地
  time="2026-10-31"

  - **怎么跟它说**：确认好上述方案后，要求 Agent 先建立 TODO 任务清单，按「后端接口 → 前端图表 → 样式整合 → 全量验证」分步推进，严禁一次性修改所有文件。
  - **确认的要点**：
    - 新增 `DashboardStatsVO` 数据传输类，封装分类分布、TOP5 热门书与借阅三态数量。
    - 编写 `StatsService` 与 `StatsServiceImpl`，沿用项目统一的 MyBatis-Plus 内存聚合方式，零原生 SQL 安全聚合数据。
    - 编写 `StatsController`，挂载 `GET /stats/dashboard` 接口，并添加 `ensureAdmin()` 方法进行权限保护，普通读者无法越权查看全馆统计。
    - 用 curl 模拟管理员调用接口，核对返回数据与数据库实际记录严格吻合（分类 8/5/4/2/2/2/1 篇，借阅三态 4/2/2 次，热门第一《深入理解计算机系统》借阅 2 次）。

  ::: file-tree
  - bookhub/src/main/java/org/example/bookhub/
    - controller/
      - StatsController.java # 本轮新增：管理员首页统计接口
    - dto/response/
      - DashboardStatsVO.java # 本轮新增：统计视图传输对象
    - service/
      - StatsService.java # 本轮新增：统计业务接口
      - impl/
        - StatsServiceImpl.java # 本轮新增：多表数据聚合业务实现
  :::

- 步骤五 · 前端接入 ECharts 与解决 Canvas 0 渲染时序
  time="2026-10-31"

  - **怎么跟它说**：在 `index.html` 引入 ECharts 5 CDN；改造 `app.js` 的 `renderAdminDashboard`，把之前散落的 3 个请求合并为单次 `/stats/dashboard` 聚合调用；在 `styles.css` 中增加图表栅格与排行榜样式。
  - **确认的要点与真实踩坑**：
    - **踩坑一（时序 Bug）**：代码改完后，页面中生成了图表容器，但 **Canvas 数量为 0，图表完全空白**。排查发现由于页面使用了 Vue 的 `<transition mode="out-in">` 视图切换淡入淡出动画，代码在 `nextTick` 就执行了 `echarts.init()`，此时新页面的 `$refs` 元素尚未挂载到真实的 DOM 树中，被条件守卫静默跳过。Agent 将图表初始化改为等待过渡动画结束或通过轮询守卫确认挂载后再绘制，顺利解决。
    - **踩坑二（静态资源缓存）**：Spring Boot 启动时默认从 `target/classes` 读取静态资源，直接修改 `src/main/resources/static/app.js` 源码后浏览器拉取的仍是旧代码。重新构建并重启应用加载最新脚本。

  ::: file-tree
  - bookhub/src/main/resources/static/
    - index.html # 本轮修改：引入 ECharts 5.5.1 CDN
    - app.js # 本轮修改：聚合请求、动画时序适配与图表实例管理
    - styles.css # 本轮修改：新增图表卡片栅格、环形图与 TOP5 榜单样式
  :::

- 步骤六 · 全流程回归测试与权限交付
  time="2026-10-31"

  - **怎么跟它说**：在浏览器中全面测试各种交互行为，并切换普通用户身份，确认老业务不受影响。
  - **确认的要点**：
    - 检查图表 Hover 提示框（Tooltip）与色彩配比，确认与陶土橘设计系统一致。
    - 视图往返切换测试：从首页切换至「图书管理」页面，再切回首页，图表正常销毁（`dispose`）并重新渲染，无内存泄漏与报错。
    - 权限隔离回归：使用普通学生账号（`student`）登录，首页展示原有的学生私有借阅卡片，绝不会加载或暴露管理员专享图表，接口鉴权拦截正常。
    - 检查浏览器控制台，确认 0 错误、0 警告。

  ![最终完成版：管理员首页数据全景看板](/images/case-bookhub/bookhub-home-after.png)
:::::

---

## 老项目维护与增量开发的避坑要点

与从零新建单文件不同，维护已有项目时需要特别注意以下四项原则：

### 1. 先读懂架构再动代码
不要一上来就让 Agent“帮我加个图表”。先问清它当前项目的架构风格（是 MVC、前后端分离还是单页内嵌？）、有哪些通用返回体（如 `ApiResponse`）、现有鉴权机制是什么（拦截器还是 Security？）。让 Agent 遵循既有的设计模式，而不是自作主张引入全新的一套规范。

### 2. 识别物理存储与动态计算的边界
像“借阅逾期”这种状态，随着时间推移会动态发生变化。如果盲目在数据库中查 `status = '逾期'`，就会漏掉所有已过应还时间但状态依然是 `未归还` 的记录。在提需求时提醒 Agent 检查数据库字段定义，能避免写出逻辑漏洞。

### 3. 注意第三方库与前端框架生命周期的时序
Vue、React 等现代前端框架普遍使用虚拟 DOM 和过渡动画（如 `<transition mode="out-in">`）。ECharts、D3 等底层直接操作真实 DOM Canvas 的库，必须在 DOM 节点真正挂载且具有计算宽高后才能初始化。遇到“无报错但图表不显示”时，首先检查容器尺寸与挂载时序。

### 4. 增量功能必须回归权限隔离
后台管理系统中最忌讳权限越权。为管理员增加的聚合统计接口，必须由后端守卫严格校验角色（如 `ensureAdmin()`），且前端必须使用不同身份（管理员 vs 普通用户）分别登录测试，确保新功能不会对其他角色造成侧漏。

---

## 开始之前：环境准备

如果你想在本地复现本案例，需要准备以下开发环境：

| 依赖软件 | 最低版本要求 | 检查命令 | 说明 |
| :--- | :--- | :--- | :--- |
| **JDK** | 17 或 21 | `java -version` | 推荐使用 Eclipse Temurin 或 OpenJDK 17+ |
| **Maven** | 3.8+ | `mvn -v` | 项目构建与依赖管理工具 |
| **MySQL / MariaDB** | 8.0+ / 10.4+ | `mysql -V` | 关系型数据库，保持本地 3306 端口运行 |

### 本地启动步骤

1. 在 MySQL / MariaDB 中创建名为 `bookhub` 的空数据库：
   ```sql
   CREATE DATABASE IF NOT EXISTS bookhub DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. 检查 `src/main/resources/application.properties` 中的数据库账号与密码配置（默认用户名 `root`，密码可通过配置或环境变量指定）。
3. 在项目根目录下执行启动命令：
   ```bash
   mvn spring-boot:run
   ```
   首次启动时，系统会自动执行 `schema.sql` 建表并由 `data.sql` 注入预置的测试数据。
4. 打开浏览器访问 `http://localhost:8081`（或实际配置端口），使用系统内置账号登录：
   - 管理员账号：`admin` / `123456`
   - 普通读者账号：`student` / `123456`
