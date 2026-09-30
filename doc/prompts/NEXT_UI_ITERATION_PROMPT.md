# DevMatrix 下一阶段界面开发任务

你正在继续开发：

DevMatrix 研发智能体协同工作平台

当前仓库：

ziyotko/dev-matrix

当前已经完成第一版前端 Demo。

本轮不是重新设计项目，而是在现有实现基础上继续完善。

---

# 一、开始前必须做的事情

先完整阅读：

- doc/DSH软件工程智能协同平台建设计划v1.0.md
- doc/DSH软件工程智能体Skill能力手册v1.0.md
- doc/DSH软件工程统一研发规范v1.0.md
- doc/prompts/CODEX_UI_DEMO_PROMPT.md

然后检查当前工程：

- src/views
- src/components
- src/stores
- src/mock
- src/types
- src/utils/permission.ts
- src/router

理解现有功能后再修改。

不要重新搭建项目。

不要推翻现有 UI。

不要重复实现已经存在的功能。

---

# 二、本轮目标

本轮要把 DevMatrix 从：

“项目管理 + AI 执行演示”

进一步提升为：

“需求 → 智能拆解 → 人/智能体协同执行 → 人工审核 → 交付物”

完整研发协同 Demo。

本轮重点完成以下 6 项。

---

# 三、任务一：修正现有权限与数据模型问题

这是最高优先级。

当前必须明确：

能查看
≠
能编辑
≠
能执行
≠
能删除

## 1. 项目 createdBy 必须正确

当前创建项目时：

createdBy 必须是当前登录用户。

不能直接等于 ownerId。

例如：

张主任创建项目，
负责人选择张三。

则：

createdBy = 张主任
ownerId = 张三

删除权限仍然属于张主任。

---

## 2. 删除规则继续保持强规则

项目：

project.createdBy === currentUser.id

才能删除。

任务：

task.createdBy === currentUser.id

才能删除。

领导、负责人、协作成员均不得因为身份获得删除权限。

没有权限：

不要显示删除按钮。

---

## 3. 上级可见不等于上级可编辑

调整：

canViewProject

canEditProject

canViewTask

canEditTask

canExecuteTask

canDeleteProject

canDeleteTask

原则：

### 上级

可以查看下级项目。

但不能因为是领导就自动编辑下级项目。

### 项目编辑

优先允许：

- 项目创建人
- 项目负责人

### 任务编辑

允许：

- 任务创建人
- 任务负责人
- 协作成员

根据现有 Demo 需要合理实现。

### 删除

仍然只能创建人。

---

# 四、组织层级、团队、岗位分离

当前不要继续把 deptId 当 teamId 使用。

扩充 User 数据模型。

建议：

```ts
interface User {
  id: string
  name: string
  title: string

  orgLevel:
    | 'leader'
    | 'manager'
    | 'member'

  departmentId: string

  teamId: string

  jobRole:
    | 'project_manager'
    | 'developer'
    | 'tester'
    | 'ops'

  managerId: string | null
}
```

组织关系：

研发中心

├── 张主任
│
├── 产品研发部
│   ├── 李经理
│   ├── 产品研发一组
│   │   ├── 张三
│   │   └── 王五
│   └── 产品研发二组
│       └── 赵六
│
└── 平台研发部
    ├── 王经理
    └── 平台研发组
        ├── 孙七
        └── 周八

---

权限维度必须分开：

组织层级
≠
部门
≠
团队
≠
岗位

---

# 五、任务二：真正实现项目编辑

当前项目详情里的：

编辑项目

不能再显示：

“演示版暂未开放”。

实现项目编辑 Drawer。

可以编辑：

- 项目名称
- 项目标识
- 项目描述
- 项目负责人
- 所属团队
- 项目成员
- 项目状态

保持现有 Plane 风格。

不要增加复杂页面。

点击：

...
→ 编辑项目
→ 右侧 Drawer

---

# 六、任务三：真正实现任务编辑

当前任务详情里的：

编辑任务

不能再是假按钮。

实现编辑任务 Drawer。

允许编辑：

- 任务标题
- 描述
- 类型
- 负责人
- 协作成员
- 优先级
- 截止日期
- 执行方式
- Agent
- Skill

必须复用新建任务组件结构。

尽量不要复制一套完全重复代码。

可以考虑：

TaskFormDrawer.vue

或者让：

NewTaskDrawer.vue

同时支持：

create

edit

两种模式。

---

# 七、任务四：增加“需求管理 + AI 智能拆解”

这是本轮最重要的新功能。

这是 DevMatrix 和普通项目管理工具之间的重要区别。

---

## 项目详情增加导航

当前：

概览
任务
成员
交付物
活动

修改为：

概览
需求
任务
成员
交付物
活动

---

# 八、需求列表

增加项目级需求列表。

示例：

REQ-001
知识库智能问答能力
高
● 分析中 / 待拆解 / 已拆解 / 已确认
张三
9月30日

建议字段：

- 需求编号
- 标题
- 状态
- 优先级
- 创建人
- 创建时间
- 关联任务数量

---

# 九、新建需求

项目详情：

+ 新建需求

使用 Drawer。

字段：

需求标题 *
需求描述 *
优先级
期望完成日期
附件

Mock 示例：

标题：

知识库智能问答能力

描述：

实现企业知识库智能问答功能。

要求：

1. 支持自然语言问题
2. 支持向量检索
3. 支持知识分类过滤
4. 回答展示引用来源
5. 支持权限控制
6. 支持后台管理
7. 需要接口测试与页面测试

按钮：

保存需求
保存并智能拆解

---

# 十、Dispatch Agent 智能拆解

点击：

AI 智能拆解

打开一个右侧工作区或者 Drawer。

不要做 ChatGPT 聊天框。

必须表现成：

“研发任务拆解工作台”。

顶部：

Dispatch Agent
调度智能体
● 正在分析

模拟流程：

✓ 读取需求
✓ 分析需求范围
✓ 加载统一研发规范
✓ 判断涉及研发领域
✓ 生成任务结构
✓ 分析任务依赖
✓ 分配建议智能体

每步 500ms - 1000ms 动态推进。

---

# 十一、智能拆解结果

执行完成后显示：

已生成 6 个研发任务。

例如：

### REQ-101
需求规格整理
领域：需求
执行者：Requirement Agent
负责人：张三
优先级：P1
预计：4h
依赖：无

### DEV-102
知识库查询接口开发
领域：开发
执行者：Development Agent
负责人：张三
优先级：P1
预计：12h
依赖：REQ-101

### DEV-103
智能问答前端开发
Development Agent
8h
依赖：DEV-102

### QUA-104
代码规范与 SQL 合规审核
Quality Agent
3h
依赖：DEV-102

### TEST-105
接口及页面测试
Test Agent
6h
依赖：
DEV-102
DEV-103

### DEP-106
测试环境部署
Deployment Agent
2h
依赖：
TEST-105

---

# 十二、拆解结果必须允许人工调整

AI 不能直接自动创建任务。

页面必须体现：

AI 建议
↓
人工确认
↓
正式进入项目任务

每一项可以调整：

- 任务标题
- 类型
- 负责人
- Agent
- 优先级
- 预计工时
- 前置依赖

支持：

删除某个建议任务
增加任务
重新拆解

底部：

取消
重新拆解
确认创建 6 个任务

点击确认创建以后：

自动写入项目任务列表。

需求状态：

已拆解
→
已确认

---

# 十三、任务增加字段

扩展 Task：

estimatedHours
dependencyIds
acceptanceCriteria
requirementId

任务详情增加：

预计工时
前置任务
关联需求
验收标准

显示保持紧凑。

不要把页面做得臃肿。

---

# 十四、任务五：优化“新建任务”权限与联动

当前新建任务不能显示所有项目。

项目列表必须根据：

canViewProject

以及当前用户是否允许在该项目创建任务

过滤。

负责人列表不能无条件显示单位全部人员。

至少优先：

项目成员
项目负责人
当前团队成员

选择任务类型以后：

自动过滤推荐 Agent。

例如：

requirement → Requirement Agent
development → Development Agent
quality → Quality Agent
test → Test Agent
deployment → Deployment Agent
operation → Operation Agent

Skill 同样过滤。

例如：

development
只优先展示开发领域和 cross Skill。

quality
只优先展示质量领域和 cross Skill。

页面中增加：

推荐

标签。

例如：

Development Agent
推荐

---

# 十五、任务六：增加真正的项目协作体验

任务详情当前已经有“活动”。

继续扩展为：

活动 + 评论。

底部增加评论输入框。

支持：

输入内容
@成员
添加附件
发送

Mock 即可。

例如：

张三：
@王五 接口已经完成，可以开始测试。

王五：
收到，我今天下午开始测试。

Development Agent：
已生成接口文档与单元测试。

---

# 十六、附件

不需要真实上传服务器。

可以模拟：

上传文件按钮

选择后显示：

接口说明.pdf
database.sql
页面设计.png

附件显示：

文件名
大小
上传人
时间

---

# 十七、交付物增强

当前已有：

交付物列表
交付物预览

继续增加：

查看
下载
版本

Mock 版本：

v1
v2
v3

点击版本显示：

版本记录

例如：

v3
Development Agent
今天 10:32
补充单元测试

v2
张三
昨天 18:20
优化权限逻辑

v1
Development Agent
昨天 16:45
首次生成

下载可以 Mock。

点击后：

ElMessage.success('演示版：交付物下载已开始')

即可。

---

# 十八、需求与任务关系

任务详情顶部增加：

关联需求：

REQ-001 知识库智能问答能力

点击可以返回项目：

需求 Tab

并定位该需求。

需求详情里显示：

关联任务 6

然后列出：

REQ-101
DEV-102
DEV-103
QUA-104
TEST-105
DEP-106

---

# 十九、展示 AI 与人协作

一定要让页面表达：

AI 不是聊天机器人。

而是：

研发执行成员。

体现：

Requirement Agent
Development Agent
Quality Agent
Test Agent
Deployment Agent
Operation Agent
Dispatch Agent

一个需求可能经过：

Dispatch Agent
↓
Requirement Agent
↓
Development Agent
↓
Quality Agent
↓
Test Agent
↓
Deployment Agent
↓
人工确认

---

# 二十、不要开发的内容

本轮不要：

- 接真实 DSH
- 接真实 Qwen
- 接真实模型 API
- 接真实 Go 后端
- 接真实 MySQL
- 接 SSH
- 接 Git
- 自动部署
- CI/CD
- 甘特图
- Token 成本
- 大屏
- 复杂报表
- 复杂运维管理
- 重做整个系统管理
- 重写现有 Layout

全部继续：

Mock + Pinia + localStorage

---

# 二十一、UI 风格不能改变

继续保持当前：

Plane / Linear

风格。

不要突然变成：

传统 Vue Admin
OA
ERP
大数据 Dashboard

继续保持：

小圆角
细边框
少阴影
高信息密度
紧凑任务列表
小状态点
轻量 Tag

---

# 二十二、特别注意

不要为了添加需求管理，把整个项目详情页做得非常重。

需求列表和任务列表的视觉语言应该一致。

参考：

Plane Issue List。

---

# 二十三、响应式要求

重点保证：

1920 × 1080
1440 × 900
1366 × 768

都可以正常演示。

尤其检查：

项目详情
任务详情
Dispatch 智能拆解 Drawer

不要溢出。

---

# 二十四、Mock 数据

至少准备：

6 个需求。

其中：

2 个待拆解
2 个已拆解
2 个已确认

确保至少有一个需求：

完整关联 6 个任务。

---

# 二十五、演示链路

本轮完成以后必须可以完整演示：

张主任登录
↓
查看下属项目
↓
进入“智能客服系统”
↓
查看需求
↓
看到研发需求
↓
张三登录
↓
新建需求
“知识库智能问答能力”
↓
点击：
AI 智能拆解
↓
Dispatch Agent 动态分析
↓
自动生成：
需求任务
开发任务
质量任务
测试任务
部署任务
↓
人工修改其中一个负责人
↓
确认创建
↓
任务进入项目
↓
打开 DEV-102
↓
Development Agent 执行
↓
显示：
研发规范
Skill
修改文件
测试
↓
执行完成
↓
生成交付物
↓
人工审核
↓
任务完成
↓
回到需求
↓
看到：
完成进度
3 / 6

---

# 二十六、开发顺序

严格按照：

Phase 1
修正现有权限和 createdBy 问题。

Phase 2
项目 / 任务真实编辑。

Phase 3
需求模型 + 需求页面。

Phase 4
Dispatch Agent 智能拆解。

Phase 5
任务依赖、预计工时、验收标准。

Phase 6
评论、@成员、附件。

Phase 7
交付物版本。

Phase 8
统一视觉和交互。

---

# 二十七、每个 Phase 完成后

运行：

npm run build
npm run lint

如果存在错误：

先修复。

禁止带着 build 错误继续下一 Phase。

---

# 二十八、浏览器验证

如果当前 Agent 支持 Playwright：

每完成主要 Phase 后进行实际浏览器验证。

必须通过正常用户操作：

点击
输入
选择
切换
打开 Drawer
确认 Dialog

不要通过修改 Vue 内部状态绕过页面。

---

# 二十九、不要进行大面积无关修改

本轮开发必须遵循：

最小必要修改原则。

不要：

修改几十个无关文件。

不要：

为了加一个功能重写整个 store。

不要：

重新设计整个 CSS 系统。

不要：

删除当前已经工作的页面。

---

# 三十、最终验收

最终必须做到：

npm run build

成功。

npm run lint

不存在阻断性错误。

核心演示链路可以完整操作。

---

# 最终产品感觉

领导看到的应该是：

需求进来了
↓
AI 自动理解需求
↓
AI 帮项目经理拆成研发任务
↓
人确认任务
↓
人和智能体共同执行
↓
AI 生成结果
↓
人审核
↓
沉淀交付物

而不是：

“这是一个带 AI 按钮的任务管理系统。”

现在直接开始检查当前代码并实施。

不要先输出长篇实施方案。

先检查现状，再按 Phase 1 开始修改。
