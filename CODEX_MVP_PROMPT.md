你现在要在现有 Vue 项目中实现一个「研发智能体协同工作平台」MVP。

目标不是做复杂项目管理系统，而是先把最核心的协作链路跑通：

1. 不同组织层级的人可以看到自己权限范围内的项目
2. 同一个团队的成员可以互相查看项目和任务
3. 用户可以创建项目、创建任务
4. 用户可以进入任务真正开展工作
5. 任务可以由人工执行，也可以调用智能体执行
6. 删除权限必须严格限制：只能删除自己创建的数据，任何人都不能删除别人创建的项目或任务

请直接修改项目代码并完成可运行页面，不要只输出设计说明。

---

# 一、技术要求

使用：

* Vue 3
* TypeScript
* Element Plus
* Vue Router
* Pinia
* Composition API
* `<script setup lang="ts">`

如果现有项目已经存在：

* 路由体系
* 状态管理
* Layout
* API 封装
* CSS 变量
* 公共组件
* Icon 体系

优先复用。

不要重新搭一套重复架构。

---

# 二、整体 UI 风格要求

整个系统的视觉和交互风格重点参考：

**Plane 项目管理平台**

但注意：

不是复制 Plane 源码、品牌、Logo 或像素级照搬。

而是学习 Plane 的：

* 页面布局
* 信息密度
* 项目导航方式
* Issue / Task 列表体验
* 任务详情体验
* 状态体系
* 标签体系
* 成员头像展示
* 轻量化项目管理体验

最终形成我们自己的「研发智能体协同工作平台」。

---

# 三、Plane 风格设计原则

整个系统不要设计成传统政府后台，也不要设计成大数据驾驶舱。

禁止大量：

* 大 KPI 卡片
* 渐变背景
* 大面积阴影
* 五颜六色图表
* 巨大的欢迎 Banner
* 装饰性数据大屏

整体应该像一个真正每天工作的研发工具。

参考 Plane / Linear / GitHub Projects 一类产品。

核心关键词：

```text
克制
清爽
紧凑
现代
专业
高信息密度
工具感
研发感
```

---

# 四、整体布局

采用：

```text
左侧导航
+
顶部区域
+
主工作区域
```

大致：

```text
┌──────────┬──────────────────────────────────────────┐
│          │ 项目名称 / 页面名称        搜索  +新建  │
│          ├──────────────────────────────────────────┤
│ 左侧导航 │                                          │
│          │                                          │
│ 工作台   │              主内容区                   │
│ 项目     │                                          │
│ 任务     │                                          │
│ 智能体   │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

---

# 五、左侧导航参考 Plane

左侧 Sidebar 不要过宽。

建议宽度：

```text
220px - 240px
```

顶部：

```text
研发智能体协同平台
```

下面：

```text
工作台

项目管理

任务中心

智能体中心
```

再增加：

```text
我的项目
```

可以列出用户最近访问的几个项目：

```text
● 智能客服系统
● 门户改版项目
● 研发效能平台
```

这样用户可以直接快速进入项目。

底部：

```text
管理后台
当前用户
```

---

# 六、页面视觉细节

参考 Plane 的轻量 UI。

## 背景

整体：

```text
#F8F9FB
```

内容区域：

```text
#FFFFFF
```

不要大面积蓝色背景。

---

## 边框

主要依靠：

```text
1px solid #E5E7EB
```

区分区域。

少用 Box Shadow。

---

## 圆角

保持克制：

```text
6px - 8px
```

不要大量 16px / 20px 超大圆角。

---

## 主色

主色可以使用：

```text
#4F46E5
```

或者：

```text
#2563EB
```

只用于：

* 主按钮
* 当前导航
* 链接
* 重要状态

不要满屏蓝色。

---

# 七、项目管理风格

项目列表不要做成很多巨大的卡片。

优先参考 Plane：

```text
列表
+
轻量分组
```

例如：

```text
项目管理                                      + 新建项目

搜索项目...

项目名称               负责人      关系        状态       更新时间

智能客服系统            张三        我参与的    进行中     10分钟前

门户平台改版            王五        同团队      进行中     1小时前

资产管理系统            李经理      下级项目    进行中     昨天
```

每一行：

* Hover 高亮
* 点击整行进入详情
* 操作按钮放右侧
* 鼠标 Hover 时再出现更多操作

不要每个项目都做巨大 Card。

---

# 八、项目状态视觉

使用 Plane 风格的小状态标签。

例如：

```text
● 规划中
● 进行中
● 已完成
```

不要使用面积很大的彩色 Tag。

可以：

```text
小圆点 + 文本
```

---

# 九、核心权限模型

必须把：

```text
组织层级权限
```

和：

```text
岗位角色权限
```

完全分开。

定义三级组织层级：

```ts
type OrgLevel = 'leader' | 'manager' | 'member'
```

对应：

```text
leader
大领导

manager
中层负责人

member
普通成员
```

---

# 十、组织结构 Mock

例如：

```text
研发中心

├── 张主任
│   大领导
│
├── 产品研发部
│   ├── 李经理
│   ├── 张三
│   ├── 王五
│   └── 赵六
│
└── 平台研发部
    ├── 王经理
    ├── 孙七
    └── 周八
```

用户模型：

```ts
interface User {
  id: string
  name: string

  avatar?: string

  orgLevel:
    | 'leader'
    | 'manager'
    | 'member'

  departmentId: string

  teamId: string

  managerId?: string

  jobRole:
    | 'project_manager'
    | 'developer'
    | 'tester'
    | 'ops'
}
```

---

# 十一、项目可见规则

统一建立：

```ts
canViewProject(currentUser, project)
```

不要把逻辑直接写在 Vue 页面。

---

## 大领导

大领导：

```text
可以查看整个组织下的项目
```

包括：

* 自己项目
* 中领导项目
* 普通成员项目

但是：

```text
能看 ≠ 能删
```

---

## 中领导

中领导可以查看：

* 自己项目
* 自己负责项目
* 自己下属成员项目
* 自己 Team 项目

不能查看其他部门无关项目。

---

## 普通成员

普通成员可以查看：

* 自己创建的项目
* 自己负责的项目
* 自己参与的项目
* 同 Team 成员项目

核心规则：

```text
一个团队可以互相看。
```

---

# 十二、项目可见原因

项目列表必须显示：

```text
为什么我可以看到这个项目
```

定义：

```ts
type VisibilityReason =
  | 'owner'
  | 'member'
  | 'team'
  | 'subordinate'
```

对应 UI：

```text
我创建的

我参与的

同团队

下级项目
```

这几个标签同样使用 Plane 风格：

尺寸小、低饱和度、轻量。

---

# 十三、删除权限

这是强规则。

项目：

```ts
function canDeleteProject(user, project) {
  return project.createdBy === user.id
}
```

任务：

```ts
function canDeleteTask(user, task) {
  return task.createdBy === user.id
}
```

只有创建人可以删除。

---

即使当前用户是：

```text
大领导
中领导
项目经理
项目负责人
任务负责人
```

只要：

```text
createdBy !== currentUser.id
```

就不能删除。

---

例如：

```text
张三创建任务
↓
负责人：王五
```

权限：

```text
张三
可以删除

王五
不能删除

李经理
不能删除

张主任
不能删除
```

---

# 十四、删除按钮

没有删除权限：

**直接不显示删除按钮。**

例如：

```vue
<el-button
  v-if="canDeleteTask(currentUser, task)"
  type="danger"
>
  删除
</el-button>
```

不要显示：

```text
删除（无权限）
```

删除必须二次确认：

```text
确定删除该任务吗？

删除后无法恢复。
```

---

# 十五、统一权限模块

建立：

```text
src/utils/permission.ts
```

或者：

```text
src/composables/usePermission.ts
```

统一实现：

```ts
canViewProject()

canEditProject()

canDeleteProject()

canViewTask()

canEditTask()

canExecuteTask()

canDeleteTask()
```

Vue 页面不要自行判断复杂权限。

---

# 十六、权限原则

系统必须体现：

```text
能看到
≠
能修改
≠
能执行
≠
能删除
```

查看：

由：

```text
组织关系
团队关系
项目成员关系
```

决定。

编辑：

主要由：

```text
创建人
项目负责人
任务负责人
```

决定。

执行：

主要由：

```text
任务负责人
协作成员
```

决定。

删除：

只由：

```text
createdBy
```

决定。

---

# 十七、身份模拟

页面右上角提供：

```text
当前身份

张主任 / 大领导 ▼
```

点击可以切换：

```text
张主任
大领导

李经理
产品研发部经理

王经理
平台研发部经理

张三
开发工程师

王五
测试工程师

赵六
运维工程师
```

切换后：

```text
项目列表
任务列表
工作台
权限
```

立即发生变化。

这个功能必须保留，方便演示权限体系。

---

# 十八、工作台

路由：

```text
/
```

不要做传统数据大屏。

参考 Plane Home / Workspace 风格。

顶部：

```text
上午好，张三

开发工程师 · 产品研发部
```

右边：

```text
+ 新建任务
```

---

下面首先显示：

```text
我的任务
```

按简单分组：

```text
待处理

进行中

待审核
```

每条任务像 Plane Issue：

```text
DEV-102

实现知识库查询接口

● 进行中

智能客服系统

张三

今天
```

点击整行进入任务工作台。

---

再显示：

```text
最近项目
```

只需要轻量列表。

不要做复杂图表。

---

# 十九、项目列表页

路由：

```text
/projects
```

顶部：

```text
项目管理

所有你有权限查看的项目
```

右侧：

```text
搜索

+ 新建项目
```

---

列表：

```text
项目名称

负责人

我的关系

进度

状态

更新时间
```

例如：

```text
智能客服系统

张三

我参与的

42%

进行中

10分钟前
```

Hover 后出现：

```text
...
```

菜单：

```text
编辑
删除
```

删除仅创建人出现。

---

# 二十、项目详情页

路由：

```text
/projects/:id
```

整体参考 Plane Project。

顶部采用紧凑布局：

```text
智能客服系统

AI-CS
```

下面：

```text
负责人 张三

创建人 李经理

成员 6

● 进行中
```

右侧：

```text
+ 新建任务
```

---

项目内部导航：

```text
概览

任务

成员

文件
```

第一版默认：

```text
任务
```

---

# 二十一、任务列表参考 Plane Issue

这是视觉重点。

不要做传统 Element Plus 大表格。

尽量做成 Plane Issue List 风格。

例如：

```text
┌──────────────────────────────────────────────────────┐

  DEV-101    登录接口开发

             ● 进行中

             高优先级

             张三

             9月25日

────────────────────────────────────────────────────────

  TEST-102   登录功能测试

             ○ 待处理

             普通

             王五

             9月28日

└──────────────────────────────────────────────────────┘
```

每一行紧凑。

Hover：

```text
background: #F9FAFB
```

点击整行进入任务详情。

---

# 二十二、任务状态

参考 Plane 的 Issue State。

定义：

```text
待处理
进行中
待审核
已完成
```

状态控件采用：

```text
小圆点
+
文字
+
Dropdown
```

例如：

```text
● 进行中 ▼
```

不要使用很大的 Element Plus Tag。

---

# 二十三、优先级

采用：

```text
紧急
高
普通
低
```

视觉同样保持轻量。

可以使用：

```text
图标 + 文字
```

而不是大色块。

---

# 二十四、新建任务体验

参考 Plane 新建 Issue。

点击：

```text
+ 新建任务
```

建议使用：

```text
右侧 Drawer
```

或者：

```text
居中 Modal
```

不要跳一个特别复杂的新页面。

第一版优先：

```text
Drawer
```

这样更加像现代项目协作工具。

字段：

```text
任务名称 *

任务描述

项目 *

类型 *

负责人 *

协作成员

优先级

截止日期

执行方式
```

---

执行方式：

```text
人工执行

智能体执行
```

如果选择：

```text
智能体执行
```

显示：

```text
智能体
```

例如：

```text
需求智能体

开发智能体

测试智能体

部署智能体

运维智能体
```

---

普通用户绝对不要看到：

```text
YAML

Profile

Patch

Temperature

Token

底层模型参数
```

全部隐藏。

---

# 二十五、任务详情 / 工作台

这是系统最重要页面。

参考：

```text
Plane Issue Detail
+
OpenHands Agent Workspace
```

设计。

---

左侧主区域约：

```text
65%
```

右侧智能体区域：

```text
35%
```

---

顶部：

```text
DEV-102

实现知识库查询接口
```

下面一排：

```text
● 进行中

高优先级

负责人 张三

截止 9月25日
```

保持 Plane 风格。

---

# 二十六、任务正文

左侧显示：

```text
任务描述
```

正文支持 Markdown。

下面：

```text
子任务 / 工作项
```

例如：

```text
☑ 创建 Controller

☑ 创建 Service

☐ 接入知识库

☐ 编写测试
```

支持新增工作项：

```text
+ 添加工作项
```

---

# 二十七、工作记录

下面增加：

```text
工作记录
```

采用类似评论 / Activity 的体验。

例如：

```text
张三

今天 14:32

完成知识库 Service 基础结构，
下一步接入向量检索。
```

下面输入：

```text
记录工作进展...
```

按钮：

```text
发送
```

不要做复杂日报。

---

# 二十八、右侧智能体工作区

如果任务类型：

```text
agent
```

右侧显示：

```text
AI 智能体
```

顶部：

```text
Development Agent
```

状态：

```text
● 空闲
```

下面：

```text
执行要求
```

Textarea：

```text
请根据当前任务完成开发，
遵循项目现有代码规范。
```

按钮：

```text
▶ 开始执行
```

---

# 二十九、智能体执行体验

参考 OpenHands / Dify，但保持简洁。

点击：

```text
开始执行
```

以后显示：

```text
Development Agent

● 正在运行
```

执行日志：

```text
✓ 读取项目上下文

✓ 分析任务要求

✓ 检查已有代码

→ 正在生成代码

○ 运行测试
```

完成后：

```text
✓ 执行完成
```

---

# 三十、AI 执行结果

执行完成后不要直接输出一大段聊天文字。

做成：

```text
本次执行结果
```

例如：

```text
修改文件 3

新增文件 1

测试 12 / 12 通过
```

下面：

```text
knowledge_controller.ts

knowledge_service.ts

knowledge_repository.ts

knowledge_service.test.ts
```

点击文件可以查看简单 Mock Diff。

---

底部：

```text
查看完整结果

重新执行
```

---

# 三十一、智能体定位

整个系统不要设计成：

```text
ChatGPT 聊天机器人
```

而应该体现：

```text
AI 是一个研发执行成员
```

也就是说：

用户创建：

```text
任务
```

然后：

```text
人
```

或者：

```text
智能体
```

去完成这个任务。

这是整个产品最核心的产品理念。

---

# 三十二、任务中心

路由：

```text
/tasks
```

参考 Plane My Issues。

顶部：

```text
我的任务
```

Filter：

```text
全部

分配给我

我创建的

进行中

已完成
```

下面继续使用 Issue List。

---

# 三十三、智能体中心

第一版非常简单。

显示：

```text
智能体中心
```

卡片保持克制。

例如：

```text
需求智能体

负责需求分析、任务拆解

● 可用
```

```text
开发智能体

负责代码开发与修改

● 可用
```

```text
测试智能体

负责测试设计与执行

● 可用
```

不要现在开发复杂配置页面。

---

# 三十四、Mock 数据要求

至少：

```text
8 个项目

6 个用户

15 个任务
```

覆盖：

```text
leader

manager

member
```

项目必须包含：

```text
本人项目

本人参与项目

同团队项目

下级项目

其他部门项目
```

这样可以验证权限。

---

# 三十五、Project 数据模型

```ts
interface Project {
  id: string

  name: string

  code: string

  createdBy: string

  ownerId: string

  departmentId: string

  teamId: string

  memberIds: string[]

  description: string

  status:
    | 'planning'
    | 'active'
    | 'completed'

  progress: number

  createdAt: string

  updatedAt: string
}
```

---

# 三十六、Task 数据模型

```ts
interface Task {
  id: string

  projectId: string

  title: string

  description: string

  createdBy: string

  ownerId: string

  collaboratorIds: string[]

  type:
    | 'requirement'
    | 'development'
    | 'test'
    | 'deployment'
    | 'operation'

  executionType:
    | 'human'
    | 'agent'

  status:
    | 'todo'
    | 'doing'
    | 'review'
    | 'done'

  priority:
    | 'low'
    | 'medium'
    | 'high'
    | 'urgent'

  deadline?: string
}
```

---

# 三十七、持久化

MVP 阶段暂时不接后端。

使用：

```text
Pinia
+
localStorage
```

保存：

```text
新增项目

新增任务

修改状态

删除数据

工作记录
```

刷新页面不能全部恢复初始状态。

---

# 三十八、Element Plus 使用原则

虽然使用 Element Plus：

但不要让页面看起来像：

```text
默认 Element Plus 后台模板
```

需要自己调整：

```text
spacing

border

font-size

row height

hover

sidebar

dropdown

drawer
```

尤其：

不要大量使用默认：

```text
el-card
```

任务列表建议自己写 Layout。

Element Plus 主要用于：

```text
Dropdown

Dialog

Drawer

Select

DatePicker

Avatar

Tooltip

MessageBox

Form
```

---

# 三十九、Icon

统一使用：

```text
@element-plus/icons-vue
```

如果现有项目有：

```text
lucide-vue-next
```

则优先使用 Lucide。

不要使用 Emoji 作为正式 Icon。

---

# 四十、交互完整性

必须保证：

```text
所有按钮都可操作。
```

至少完成：

* 身份切换
* 项目权限过滤
* 项目详情
* 新建项目
* 新建任务
* 修改任务状态
* 分配负责人
* 添加协作成员
* 进入任务
* 添加工作项
* 填写工作记录
* 智能体模拟执行
* 执行日志
* 执行结果
* 删除自己创建的数据

---

# 四十一、必须验证的权限场景

## 张主任

```text
大领导
```

应该：

```text
能看到所有下级项目
```

但是：

```text
不能删除别人创建的项目
```

---

## 李经理

应该：

```text
看到自己团队
+
自己下属
```

项目。

不能看到其他部门无关项目。

---

## 张三

应该：

```text
看到自己项目
+
自己参与项目
+
同团队项目
```

不能看到无关团队项目。

---

# 四十二、删除测试

例如：

```text
任务 A
```

createdBy：

```text
zhangsan
```

owner：

```text
wangwu
```

张三登录：

```text
显示删除
```

王五登录：

```text
不显示删除
```

李经理：

```text
不显示删除
```

张主任：

```text
不显示删除
```

这是强制要求。

---

# 四十三、当前不要实现

不要实现：

```text
甘特图

项目风险

成本分析

Token 统计

复杂数据驾驶舱

Skill 市场

知识社区

复杂审批流

YAML 编辑器

Profile 编辑器

Patch 管理

模型参数中心

Git 仓库管理

复杂部署中心
```

这些全部属于后续版本。

---

# 四十四、MVP 产品主链路

最终页面必须让下面流程非常顺畅：

```text
登录 / 切换身份

↓

看到自己有权限查看的项目

↓

进入项目

↓

查看任务

↓

创建任务

↓

指定负责人

↓

选择人工 / 智能体

↓

进入任务工作台

↓

人工工作
或者
AI 执行

↓

记录执行过程

↓

任务完成
```

这是当前版本最重要的事情。

---

# 四十五、UI 最终目标

请牢记：

最终页面应该让人第一眼感觉：

```text
这是一个类似 Plane / Linear 的
现代研发协作工具
```

然后第二眼发现：

```text
它比普通项目管理软件多了
“智能体可以直接执行任务”
```

而不是：

```text
这是一个传统 OA
+
几个 AI 按钮。
```

---

# 四十六、开发执行要求

现在开始：

1. 先检查现有工程
2. 查看当前页面结构
3. 查看已有路由
4. 查看已有状态管理
5. 查看已有组件
6. 保留可复用代码
7. 按上述方向修改

不要先输出长篇方案。

直接开始编码。

每完成一个主要阶段：

```bash
npm run build
```

或者执行项目已有的：

```text
typecheck
lint
test
```

发现问题立即修复。

最终必须保证：

```bash
npm run build
```

成功。

不要留下：

```text
TypeScript Error

ESLint Error

未引用变量

路由不存在

按钮点击无反应

Mock 数据空白
```

最终交付一个：

**能切身份、能看项目、能创建任务、能进入任务真正工作、能让智能体执行任务的 Plane 风格研发协同平台 MVP。**
