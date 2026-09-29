import type {
  Agent,
  Deliverable,
  Dept,
  ExecutionRecord,
  Project,
  Skill,
  Task,
  User
} from '@/types'

/** 相对当前时间的 ISO 时间（n 分钟前） */
const minsAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString()
/** 相对当前时间的 ISO 时间（n 小时前） */
const hoursAgo = (n: number) => minsAgo(n * 60)
/** 相对当前时间的 ISO 时间（n 天前，可选指定当天小时） */
const daysAgo = (n: number, h?: number) => {
  const d = new Date(Date.now() - n * 86_400_000)
  if (h !== undefined) d.setHours(h, 0, 0, 0)
  return d.toISOString()
}
/** 今天某个时刻 */
const todayAt = (h: number, m: number) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

/* ================= 部门 ================= */
export const mockDepts: Dept[] = [
  { id: 'rd-center', name: '研发中心', parentId: null },
  { id: 'product-rd', name: '产品研发部', parentId: 'rd-center' },
  { id: 'platform-rd', name: '平台研发部', parentId: 'rd-center' }
]

/* ================= 用户 ================= */
export const mockUsers: User[] = [
  {
    id: 'u-zhang',
    name: '张主任',
    title: '研发中心负责人',
    role: 'leader',
    deptId: 'rd-center',
    managerId: null,
    color: '#4f46e5'
  },
  {
    id: 'u-boss',
    name: '大领导',
    title: '研发中心负责人',
    role: 'leader',
    deptId: 'rd-center',
    managerId: 'u-zhang',
    color: '#7c3aed'
  },
  {
    id: 'u-li',
    name: '李经理',
    title: '产品研发部负责人',
    role: 'manager',
    deptId: 'product-rd',
    managerId: 'u-zhang',
    color: '#0ea5e9'
  },
  {
    id: 'u-wang',
    name: '王经理',
    title: '平台研发部负责人',
    role: 'manager',
    deptId: 'platform-rd',
    managerId: 'u-zhang',
    color: '#0d9488'
  },
  {
    id: 'u-zhangsan',
    name: '张三',
    title: '开发工程师',
    role: 'member',
    deptId: 'product-rd',
    managerId: 'u-li',
    color: '#2563eb'
  },
  {
    id: 'u-wangwu',
    name: '王五',
    title: '测试工程师',
    role: 'member',
    deptId: 'product-rd',
    managerId: 'u-li',
    color: '#d97706'
  },
  {
    id: 'u-zhaoliu',
    name: '赵六',
    title: '运维工程师',
    role: 'member',
    deptId: 'product-rd',
    managerId: 'u-li',
    color: '#dc2626'
  },
  {
    id: 'u-sunqi',
    name: '孙七',
    title: '开发工程师',
    role: 'member',
    deptId: 'platform-rd',
    managerId: 'u-wang',
    color: '#16a34a'
  },
  {
    id: 'u-zhouba',
    name: '周八',
    title: '测试工程师',
    role: 'member',
    deptId: 'platform-rd',
    managerId: 'u-wang',
    color: '#9333ea'
  }
]

/* ================= 智能体 ================= */
export const mockAgents: Agent[] = [
  {
    id: 'a-dispatch',
    name: 'Dispatch Agent',
    cnName: '调度智能体',
    domain: 'dispatch',
    description: '负责任务拆解、优先级分配与研发资源调度。',
    status: 'idle',
    todayRuns: 6,
    successRate: 97,
    capabilities: ['任务优先级分配', '需求结构化拆解'],
    color: '#6366f1'
  },
  {
    id: 'a-req',
    name: 'Requirement Agent',
    cnName: '需求智能体',
    domain: 'requirement',
    description: '负责需求分析、需求文档生成与需求校验。',
    status: 'idle',
    todayRuns: 9,
    successRate: 96,
    capabilities: ['需求结构化拆解', '需求文档标准化生成', '任务优先级分配'],
    color: '#8b5cf6'
  },
  {
    id: 'a-dev',
    name: 'Development Agent',
    cnName: '开发智能体',
    domain: 'development',
    description: '负责代码生成、代码修改、代码重构等研发任务。',
    status: 'idle',
    todayRuns: 18,
    successRate: 94,
    capabilities: ['全栈代码生成', '代码重构优化', '接口文档生成', '代码注释生成'],
    color: '#4f46e5'
  },
  {
    id: 'a-quality',
    name: 'Quality Agent',
    cnName: '质量智能体',
    domain: 'quality',
    description: '负责代码评审、合规校验与缺陷分析。',
    status: 'running',
    todayRuns: 12,
    successRate: 98,
    capabilities: ['代码静态评审', 'SQL 合规审核', '缺陷根因分析', '技术方案评审'],
    color: '#0ea5e9'
  },
  {
    id: 'a-test',
    name: 'Test Agent',
    cnName: '测试智能体',
    domain: 'test',
    description: '负责测试用例生成、测试执行与缺陷定位。',
    status: 'idle',
    todayRuns: 11,
    successRate: 95,
    capabilities: ['测试用例自动生成'],
    color: '#16a34a'
  },
  {
    id: 'a-deploy',
    name: 'Deployment Agent',
    cnName: '部署智能体',
    domain: 'deployment',
    description: '负责部署配置生成、环境部署与发布校验。',
    status: 'idle',
    todayRuns: 5,
    successRate: 92,
    capabilities: ['部署配置生成'],
    color: '#d97706'
  },
  {
    id: 'a-ops',
    name: 'Operation Agent',
    cnName: '运维智能体',
    domain: 'operation',
    description: '负责故障分析、运维脚本生成与运维巡检。',
    status: 'idle',
    todayRuns: 7,
    successRate: 93,
    capabilities: ['故障根因分析', '运维脚本生成'],
    color: '#dc2626'
  }
]

/* ================= Skill ================= */
export const mockSkills: Skill[] = [
  {
    id: 'sk-req-split',
    name: '需求结构化拆解',
    domain: 'requirement',
    status: 'online',
    version: '1.0.0',
    capabilityType: '生成类',
    description: '将自然语言业务需求自动拆解为标准化子任务清单，匹配对应研发领域。',
    scene: '项目需求录入后智能任务拆分、迭代需求快速分解',
    inputs: ['需求描述文档', '业务目标与验收标准'],
    outputs: ['结构化任务列表', '优先级与依赖关系'],
    usageCount: 86
  },
  {
    id: 'sk-priority',
    name: '任务优先级分配',
    domain: 'requirement',
    status: 'online',
    version: '1.1.0',
    capabilityType: '分析类',
    description: '基于业务价值、紧急程度与依赖关系，智能评估并分配任务优先级。',
    scene: '多任务并行时的优先级排序、迭代排期辅助',
    inputs: ['任务清单', '业务影响范围', '时间要求'],
    outputs: ['P0-P3 优先级标记', '排序建议与排期说明'],
    usageCount: 142
  },
  {
    id: 'sk-req-doc',
    name: '需求文档标准化生成',
    domain: 'requirement',
    status: 'online',
    version: '1.0.0',
    capabilityType: '生成类',
    description: '依据需求输入，自动生成符合统一研发规范的需求规格说明书。',
    scene: '初步需求转正式需求文档、需求文档初稿生成',
    inputs: ['需求要点', '业务流程描述', '核心功能点'],
    outputs: ['需求规格说明书（Markdown）'],
    usageCount: 54
  },
  {
    id: 'sk-codegen',
    name: '全栈代码生成',
    domain: 'development',
    status: 'planned',
    version: '0.1.0',
    capabilityType: '生成类',
    description: '基于需求描述，生成符合技术栈规范的 Go 后端、Vue 前端与 MySQL 代码。',
    scene: '通用业务功能快速开发、基础 CRUD 代码生成',
    inputs: ['功能需求描述', '数据结构定义', '接口定义'],
    outputs: ['工程代码', '接口文档', '单元测试用例'],
    usageCount: 0
  },
  {
    id: 'sk-api-doc',
    name: '接口文档自动生成',
    domain: 'development',
    status: 'planned',
    version: '0.1.0',
    capabilityType: '生成类',
    description: '基于后端代码注释与接口定义，自动生成标准 RESTful 接口文档。',
    scene: '接口文档同步更新、交付文档生成',
    inputs: ['接口代码文件或代码片段'],
    outputs: ['标准接口文档', '请求参数与响应结构', '错误码与示例'],
    usageCount: 0
  },
  {
    id: 'sk-refactor',
    name: '代码重构优化',
    domain: 'development',
    status: 'online',
    version: '1.3.0',
    capabilityType: '生成类',
    description: '针对存量代码进行结构优化、规范对齐与性能优化，不改变业务逻辑。',
    scene: '代码规范整改、遗留代码优化、技术债务清理',
    inputs: ['待重构代码', '重构目标说明'],
    outputs: ['重构后代码', '变更说明', '优化点清单'],
    usageCount: 73
  },
  {
    id: 'sk-sql-audit',
    name: 'SQL 合规审核',
    domain: 'quality',
    status: 'online',
    version: '1.2.0',
    capabilityType: '审核类',
    description: '自动校验 SQL 语句的规范性、安全性与性能，识别语法问题、安全风险与慢查询隐患。',
    scene: '代码提交前 SQL 校验、数据库变更审核、SQL 上线前检查',
    inputs: ['SQL 语句', '数据库表结构'],
    outputs: ['问题清单', '严重等级', '修复建议'],
    usageCount: 128
  },
  {
    id: 'sk-static-review',
    name: '代码静态评审',
    domain: 'quality',
    status: 'online',
    version: '1.4.0',
    capabilityType: '审核类',
    description: '依据统一研发规范自动扫描代码问题，覆盖编码规范、安全漏洞与性能隐患。',
    scene: '代码提交预审、合并前质量检查',
    inputs: ['代码文件', '指定检查规则'],
    outputs: ['缺陷报告', '分级分类问题与修复建议'],
    usageCount: 156
  },
  {
    id: 'sk-testcase',
    name: '测试用例自动生成',
    domain: 'test',
    status: 'online',
    version: '1.1.0',
    capabilityType: '生成类',
    description: '基于需求文档与代码逻辑，自动生成单元测试与接口测试用例。',
    scene: '测试用例初稿生成、回归测试用例补充',
    inputs: ['需求文档', '接口定义', '代码文件'],
    outputs: ['标准测试用例集', '前置条件与预期结果'],
    usageCount: 97
  },
  {
    id: 'sk-defect',
    name: '缺陷根因分析',
    domain: 'quality',
    status: 'online',
    version: '1.0.0',
    capabilityType: '分析类',
    description: '基于缺陷描述与代码上下文，定位缺陷根因并给出修复建议。',
    scene: '缺陷分析辅助、疑难问题排查',
    inputs: ['缺陷描述', '错误日志', '相关代码片段'],
    outputs: ['根因分析报告', '修复建议', '影响范围评估'],
    usageCount: 41
  },
  {
    id: 'sk-deploy-cfg',
    name: '部署配置生成',
    domain: 'deployment',
    status: 'online',
    version: '1.0.0',
    capabilityType: '生成类',
    description: '基于项目信息与环境要求，自动生成标准化部署配置文件。',
    scene: '新环境部署、配置文件生成、环境迁移',
    inputs: ['项目基本信息', '环境参数', '资源配置'],
    outputs: ['部署 YAML 配置', '启动脚本', '环境说明'],
    usageCount: 38
  },
  {
    id: 'sk-fault',
    name: '故障根因分析',
    domain: 'operation',
    status: 'online',
    version: '1.2.0',
    capabilityType: '分析类',
    description: '基于系统日志、监控指标与错误信息，智能定位运维故障根因。',
    scene: '线上故障排查、异常告警分析',
    inputs: ['错误日志', '监控数据', '故障现象描述'],
    outputs: ['故障根因报告', '处理建议', '恢复步骤'],
    usageCount: 65
  },
  {
    id: 'sk-script',
    name: '运维脚本生成',
    domain: 'operation',
    status: 'online',
    version: '1.0.0',
    capabilityType: '生成类',
    description: '根据运维操作需求，生成标准化、可执行的运维脚本。',
    scene: '日常运维操作、批量处理、巡检脚本开发',
    inputs: ['操作目标', '执行步骤', '环境信息'],
    outputs: ['可执行 Shell 脚本', '操作说明', '风险提示'],
    usageCount: 52
  },
  {
    id: 'sk-doc-convert',
    name: '文档格式转换',
    domain: 'cross',
    status: 'online',
    version: '1.0.0',
    capabilityType: '辅助类',
    description: '实现 Markdown、Word、PDF、HTML 等研发文档格式的标准化转换。',
    scene: '交付文档格式转换、文档归档标准化',
    inputs: ['源文档', '目标格式'],
    outputs: ['目标格式文档'],
    usageCount: 88
  },
  {
    id: 'sk-comment',
    name: '代码注释生成',
    domain: 'cross',
    status: 'online',
    version: '1.1.0',
    capabilityType: '生成类',
    description: '为代码自动补充符合规范的功能注释、参数注释与返回说明。',
    scene: '遗留代码补注释、代码规范整改',
    inputs: ['代码文件', '注释粒度要求'],
    outputs: ['补充注释后的代码'],
    usageCount: 104
  },
  {
    id: 'sk-tech-review',
    name: '技术方案评审',
    domain: 'cross',
    status: 'online',
    version: '1.0.0',
    capabilityType: '审核类',
    description: '依据统一研发规范，评审技术方案的完整性、合理性与合规性。',
    scene: '技术方案预审、架构设计评审',
    inputs: ['技术方案文档'],
    outputs: ['评审意见清单', '优化建议', '风险提示'],
    usageCount: 29
  }
]

/* ================= 项目 ================= */
export const mockProjects: Project[] = [
  {
    id: 'p-cs',
    name: '智能客服系统',
    key: 'AI-CS',
    description: '面向客服场景的智能问答与工单处理系统，集成知识库检索与大模型对话能力。',
    status: 'active',
    ownerId: 'u-zhangsan',
    createdBy: 'u-li',
    deptId: 'product-rd',
    memberIds: ['u-li', 'u-zhangsan', 'u-wangwu', 'u-zhaoliu'],
    createdAt: daysAgo(42),
    updatedAt: minsAgo(10)
  },
  {
    id: 'p-eff',
    name: '研发效能平台',
    key: 'EFF',
    description: '研发过程度量与效能分析平台，覆盖任务调度、配置管理与校验执行。',
    status: 'active',
    ownerId: 'u-li',
    createdBy: 'u-zhang',
    deptId: 'product-rd',
    memberIds: ['u-li', 'u-zhangsan', 'u-wangwu', 'u-zhaoliu'],
    createdAt: daysAgo(60),
    updatedAt: hoursAgo(1)
  },
  {
    id: 'p-portal',
    name: '门户改版项目',
    key: 'PORTAL',
    description: '公司研发门户整体改版，统一入口、信息架构与视觉规范。',
    status: 'active',
    ownerId: 'u-wangwu',
    createdBy: 'u-li',
    deptId: 'product-rd',
    memberIds: ['u-li', 'u-wangwu', 'u-zhangsan'],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1)
  },
  {
    id: 'p-asset',
    name: '资产管理平台',
    key: 'ASSET',
    description: '企业资产全生命周期管理，覆盖台账、审批、盘点与报废流程。',
    status: 'active',
    ownerId: 'u-sunqi',
    createdBy: 'u-wang',
    deptId: 'platform-rd',
    memberIds: ['u-wang', 'u-sunqi', 'u-zhouba'],
    createdAt: daysAgo(55),
    updatedAt: hoursAgo(3)
  },
  {
    id: 'p-data',
    name: '数据治理平台',
    key: 'DATA',
    description: '数据质量规则引擎与元数据管理平台，支撑数据资产标准化。',
    status: 'active',
    ownerId: 'u-zhouba',
    createdBy: 'u-wang',
    deptId: 'platform-rd',
    memberIds: ['u-wang', 'u-zhouba', 'u-sunqi'],
    createdAt: daysAgo(48),
    updatedAt: hoursAgo(5)
  },
  {
    id: 'p-auth',
    name: '统一认证中心',
    key: 'AUTH',
    description: '全机构统一身份认证与单点登录服务，支持 OAuth2 / OIDC。',
    status: 'active',
    ownerId: 'u-wang',
    createdBy: 'u-zhang',
    deptId: 'platform-rd',
    memberIds: ['u-wang', 'u-sunqi', 'u-zhouba'],
    createdAt: daysAgo(70),
    updatedAt: hoursAgo(2)
  },
  {
    id: 'p-mobile',
    name: '移动办公平台',
    key: 'MOBILE',
    description: '移动端审批、消息与轻应用平台，打通企业微信入口。',
    status: 'active',
    ownerId: 'u-zhangsan',
    createdBy: 'u-li',
    deptId: 'product-rd',
    memberIds: ['u-li', 'u-zhangsan', 'u-wangwu'],
    createdAt: daysAgo(25),
    updatedAt: daysAgo(2)
  },
  {
    id: 'p-kb',
    name: '知识库平台',
    key: 'KB',
    description: '企业级知识库，支持文档管理、向量检索与智能问答。',
    status: 'active',
    ownerId: 'u-wangwu',
    createdBy: 'u-li',
    deptId: 'product-rd',
    memberIds: ['u-li', 'u-wangwu', 'u-zhangsan'],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(3)
  }
]

/* ================= 任务 ================= */
let wiSeq = 0
const wi = (title: string, done = false) => ({
  id: `wi-${++wiSeq}`,
  title,
  done
})

let actSeq = 0
const act = (actorId: string, content: string, time: string, agentId?: string) => ({
  id: `act-${++actSeq}`,
  actorId,
  agentId,
  content,
  time
})

export const mockTasks: Task[] = [
  /* ---------- 智能客服系统 ---------- */
  {
    id: 't-dev-102',
    code: 'DEV-102',
    projectId: 'p-cs',
    title: '实现知识库查询接口',
    description:
      '实现知识库查询接口。\n\n要求：\n\n1. 支持关键词检索\n2. 支持分页\n3. 支持按知识分类过滤\n4. 返回统一响应结构',
    type: 'development',
    status: 'in_progress',
    priority: 'P1',
    assigneeId: 'u-zhangsan',
    memberIds: ['u-wangwu'],
    createdBy: 'u-zhangsan',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-testcase', 'sk-static-review'],
    executionPrompt:
      '请根据当前任务要求完成开发，遵循项目研发规范，并生成必要的单元测试。',
    dueDate: '2026-09-30',
    workItems: [
      wi('创建 Controller', true),
      wi('创建 Service', true),
      wi('接入向量检索'),
      wi('编写单元测试')
    ],
    activities: [
      act('u-zhangsan', '创建任务，执行方式：智能体执行。', daysAgo(2)),
      act('u-zhangsan', '完成接口结构设计。', todayAt(10, 32)),
      act('u-zhangsan', '开始执行任务。', todayAt(10, 38), 'a-dev'),
      act('u-zhangsan', '已生成 3 个代码文件。', todayAt(10, 41), 'a-dev')
    ],
    createdAt: daysAgo(2),
    updatedAt: minsAgo(18)
  },
  {
    id: 't-dev-098',
    code: 'DEV-098',
    projectId: 'p-cs',
    title: '用户权限接口开发',
    description: '实现用户角色与权限校验接口，支持 RBAC 模型。\n\n1. 角色管理\n2. 权限点校验\n3. 接口级鉴权中间件',
    type: 'development',
    status: 'done',
    priority: 'P1',
    assigneeId: 'u-zhangsan',
    memberIds: [],
    createdBy: 'u-zhangsan',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-static-review'],
    executionPrompt: '请根据当前任务要求完成开发，遵循项目研发规范，并生成必要的单元测试。',
    dueDate: '2026-09-26',
    workItems: [wi('权限模型设计', true), wi('鉴权中间件', true), wi('单元测试', true)],
    activities: [
      act('u-zhangsan', '创建任务。', daysAgo(6)),
      act('u-zhangsan', '执行完成，测试 12/12 通过。', daysAgo(1, 20), 'a-dev'),
      act('u-li', '审核通过，任务完成。', daysAgo(1, 18))
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1, 18)
  },
  {
    id: 't-dev-101',
    code: 'DEV-101',
    projectId: 'p-cs',
    title: '登录接口开发',
    description: '实现账号密码登录与 JWT 签发接口。\n\n1. 登录校验\n2. Token 签发与刷新\n3. 登录失败限流',
    type: 'development',
    status: 'done',
    priority: 'P1',
    assigneeId: 'u-zhangsan',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-testcase'],
    executionPrompt: '请根据当前任务要求完成开发，遵循项目研发规范，并生成必要的单元测试。',
    dueDate: '2026-09-25',
    workItems: [wi('登录校验', true), wi('Token 签发', true), wi('单元测试', true)],
    activities: [
      act('u-li', '创建任务。', daysAgo(8)),
      act('u-zhangsan', '执行完成，测试 10/10 通过。', daysAgo(2, 15), 'a-dev'),
      act('u-li', '审核通过，任务完成。', daysAgo(2, 12))
    ],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(2, 12)
  },
  {
    id: 't-req-201',
    code: 'REQ-201',
    projectId: 'p-cs',
    title: '客服对话流程需求分析',
    description: '梳理客服对话主流程与异常分支，输出需求规格说明书。',
    type: 'requirement',
    status: 'done',
    priority: 'P2',
    assigneeId: 'u-li',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-req',
    skillIds: ['sk-req-doc'],
    executionPrompt: '请基于需求要点生成标准需求规格说明书。',
    dueDate: '2026-09-20',
    workItems: [wi('流程梳理', true), wi('规格说明书', true)],
    activities: [
      act('u-li', '创建任务。', daysAgo(15)),
      act('u-li', '需求规格说明书已生成。', daysAgo(12, 10), 'a-req'),
      act('u-li', '审核通过。', daysAgo(12, 8))
    ],
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12, 8)
  },
  {
    id: 't-tst-301',
    code: 'TST-301',
    projectId: 'p-cs',
    title: '知识库模块测试用例设计',
    description: '针对知识库查询接口设计功能与边界测试用例。\n\n1. 关键词检索\n2. 分页边界\n3. 分类过滤',
    type: 'test',
    status: 'in_progress',
    priority: 'P2',
    assigneeId: 'u-wangwu',
    memberIds: [],
    createdBy: 'u-wangwu',
    executionMode: 'agent',
    agentId: 'a-test',
    skillIds: ['sk-testcase'],
    executionPrompt: '请基于接口定义生成测试用例集。',
    dueDate: '2026-10-02',
    workItems: [wi('功能用例', true), wi('边界用例'), wi('回归用例')],
    activities: [
      act('u-wangwu', '创建任务。', daysAgo(3)),
      act('u-wangwu', '功能用例已生成 18 条。', hoursAgo(4), 'a-test')
    ],
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(4)
  },
  {
    id: 't-qa-401',
    code: 'QA-401',
    projectId: 'p-cs',
    title: '客服系统代码静态评审',
    description: '对客服系统核心模块执行静态代码评审，输出缺陷报告。',
    type: 'quality',
    status: 'review',
    priority: 'P2',
    assigneeId: 'u-wangwu',
    memberIds: [],
    createdBy: 'u-zhangsan',
    executionMode: 'agent',
    agentId: 'a-quality',
    skillIds: ['sk-static-review'],
    executionPrompt: '请依据统一研发规范执行代码静态评审。',
    dueDate: '2026-09-29',
    workItems: [wi('扫描核心模块', true), wi('输出缺陷报告', true)],
    activities: [
      act('u-zhangsan', '创建任务。', daysAgo(2)),
      act('u-zhangsan', '评审完成，发现 3 个中等级问题。', hoursAgo(2), 'a-quality')
    ],
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(2)
  },
  {
    id: 't-dep-501',
    code: 'DEP-501',
    projectId: 'p-cs',
    title: '客服系统预发环境部署',
    description: '将客服系统 v0.9 部署至预发环境，完成部署校验。\n\n1. 生成部署配置\n2. 执行部署\n3. 冒烟验证',
    type: 'deployment',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-zhaoliu',
    memberIds: [],
    createdBy: 'u-zhangsan',
    executionMode: 'agent',
    agentId: 'a-deploy',
    skillIds: ['sk-deploy-cfg'],
    executionPrompt: '请生成部署配置并执行预发环境部署。',
    dueDate: '2026-10-05',
    workItems: [wi('生成部署配置'), wi('执行部署'), wi('冒烟验证')],
    activities: [act('u-zhangsan', '创建任务。', daysAgo(1))],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1)
  },
  {
    id: 't-ops-601',
    code: 'OPS-601',
    projectId: 'p-cs',
    title: '客服系统生产监控配置',
    description: '配置生产环境监控告警：接口成功率、P99 延迟、错误日志。',
    type: 'operation',
    status: 'todo',
    priority: 'P3',
    assigneeId: 'u-zhaoliu',
    memberIds: [],
    createdBy: 'u-zhaoliu',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-10',
    workItems: [wi('监控项梳理'), wi('告警规则配置')],
    activities: [act('u-zhaoliu', '创建任务。', daysAgo(4))],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4)
  },

  /* ---------- 研发效能平台 ---------- */
  {
    id: 't-dev-110',
    code: 'DEV-110',
    projectId: 'p-eff',
    title: '任务调度服务开发',
    description: '实现按项目独立任务队列，支持优先级调度、并发控制与超时管理。',
    type: 'development',
    status: 'in_progress',
    priority: 'P1',
    assigneeId: 'u-zhangsan',
    memberIds: ['u-sunqi'],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-refactor'],
    executionPrompt: '请根据当前任务要求完成开发，遵循项目研发规范，并生成必要的单元测试。',
    dueDate: '2026-10-08',
    workItems: [wi('队列模型', true), wi('优先级调度'), wi('超时回收')],
    activities: [
      act('u-li', '创建任务。', daysAgo(5)),
      act('u-zhangsan', '队列模型开发完成。', hoursAgo(6), 'a-dev')
    ],
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(6)
  },
  {
    id: 't-dev-111',
    code: 'DEV-111',
    projectId: 'p-eff',
    title: '配置管理服务开发',
    description: '实现全局、领域、项目三级 YAML 配置的读写、版本快照与回滚。',
    type: 'development',
    status: 'in_progress',
    priority: 'P1',
    assigneeId: 'u-sunqi',
    memberIds: ['u-zhangsan'],
    createdBy: 'u-li',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-09',
    workItems: [wi('配置读写', true), wi('版本快照'), wi('回滚能力')],
    activities: [
      act('u-li', '创建任务。', daysAgo(5)),
      act('u-sunqi', '配置读写接口完成。', hoursAgo(8))
    ],
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(8)
  },
  {
    id: 't-req-202',
    code: 'REQ-202',
    projectId: 'p-eff',
    title: '效能平台需求规格说明书',
    description: '输出研发效能平台整体需求规格说明书。',
    type: 'requirement',
    status: 'done',
    priority: 'P2',
    assigneeId: 'u-li',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-req',
    skillIds: ['sk-req-doc', 'sk-req-split'],
    executionPrompt: '请生成需求规格说明书并拆解子任务。',
    dueDate: '2026-09-18',
    workItems: [wi('需求规格说明书', true), wi('子任务拆解', true)],
    activities: [
      act('u-li', '创建任务。', daysAgo(20)),
      act('u-li', '文档生成完成。', daysAgo(16, 14), 'a-req'),
      act('u-zhang', '审核通过。', daysAgo(16, 10))
    ],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(16, 10)
  },
  {
    id: 't-tst-302',
    code: 'TST-302',
    projectId: 'p-eff',
    title: '调度服务接口测试',
    description: '对任务调度服务 REST 接口执行功能测试。',
    type: 'test',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-wangwu',
    memberIds: [],
    createdBy: 'u-wangwu',
    executionMode: 'agent',
    agentId: 'a-test',
    skillIds: ['sk-testcase'],
    executionPrompt: '请基于接口定义生成并执行测试用例。',
    dueDate: '2026-10-12',
    workItems: [wi('用例生成'), wi('接口测试执行')],
    activities: [act('u-wangwu', '创建任务。', daysAgo(2))],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },
  {
    id: 't-qa-402',
    code: 'QA-402',
    projectId: 'p-eff',
    title: '效能平台代码评审',
    description: '对效能平台已完成模块执行代码评审。',
    type: 'quality',
    status: 'review',
    priority: 'P1',
    assigneeId: 'u-zhangsan',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-quality',
    skillIds: ['sk-static-review', 'sk-tech-review'],
    executionPrompt: '请依据统一研发规范执行代码评审。',
    dueDate: '2026-09-29',
    workItems: [wi('静态扫描', true), wi('评审报告', true)],
    activities: [
      act('u-li', '创建任务。', daysAgo(3)),
      act('u-zhangsan', '评审完成，待人工确认。', hoursAgo(1), 'a-quality')
    ],
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(1)
  },
  {
    id: 't-dep-502',
    code: 'DEP-502',
    projectId: 'p-eff',
    title: '效能平台部署配置',
    description: '生成效能平台各环境部署配置。',
    type: 'deployment',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-zhaoliu',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-deploy',
    skillIds: ['sk-deploy-cfg'],
    executionPrompt: '请生成部署配置。',
    dueDate: '2026-10-15',
    workItems: [wi('部署配置生成')],
    activities: [act('u-li', '创建任务。', daysAgo(2))],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },

  /* ---------- 门户改版项目 ---------- */
  {
    id: 't-dev-120',
    code: 'DEV-120',
    projectId: 'p-portal',
    title: '门户首页改版开发',
    description: '按新版视觉规范重构门户首页，包含信息架构调整与组件升级。',
    type: 'development',
    status: 'in_progress',
    priority: 'P1',
    assigneeId: 'u-wangwu',
    memberIds: ['u-zhangsan'],
    createdBy: 'u-li',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-06',
    workItems: [wi('视觉还原', true), wi('组件升级'), wi('响应式适配')],
    activities: [
      act('u-li', '创建任务。', daysAgo(7)),
      act('u-wangwu', '首页视觉还原完成 80%。', hoursAgo(3))
    ],
    createdAt: daysAgo(7),
    updatedAt: hoursAgo(3)
  },
  {
    id: 't-dev-121',
    code: 'DEV-121',
    projectId: 'p-portal',
    title: '项目列表页开发',
    description: '开发门户项目列表页，支持搜索、筛选与快捷入口。',
    type: 'development',
    status: 'in_progress',
    priority: 'P2',
    assigneeId: 'u-zhangsan',
    memberIds: [],
    createdBy: 'u-wangwu',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-08',
    workItems: [wi('列表接口对接', true), wi('筛选交互')],
    activities: [
      act('u-wangwu', '创建任务。', daysAgo(4)),
      act('u-zhangsan', '列表接口对接完成。', hoursAgo(5))
    ],
    createdAt: daysAgo(4),
    updatedAt: hoursAgo(5)
  },
  {
    id: 't-req-203',
    code: 'REQ-203',
    projectId: 'p-portal',
    title: '门户改版需求确认',
    description: '与业务方确认门户改版需求范围与优先级。',
    type: 'requirement',
    status: 'done',
    priority: 'P1',
    assigneeId: 'u-li',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-09-15',
    workItems: [wi('需求评审会', true), wi('需求确认单', true)],
    activities: [
      act('u-li', '创建任务。', daysAgo(18)),
      act('u-li', '需求确认完成。', daysAgo(14))
    ],
    createdAt: daysAgo(18),
    updatedAt: daysAgo(14)
  },
  {
    id: 't-tst-303',
    code: 'TST-303',
    projectId: 'p-portal',
    title: '门户回归测试',
    description: '门户改版完成后执行全量回归测试。',
    type: 'test',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-wangwu',
    memberIds: [],
    createdBy: 'u-wangwu',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-12',
    workItems: [wi('回归用例准备'), wi('回归执行')],
    activities: [act('u-wangwu', '创建任务。', daysAgo(3))],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
  },
  {
    id: 't-ops-602',
    code: 'OPS-602',
    projectId: 'p-portal',
    title: '门户 CDN 缓存配置',
    description: '配置门户静态资源 CDN 缓存策略。',
    type: 'operation',
    status: 'done',
    priority: 'P3',
    assigneeId: 'u-zhaoliu',
    memberIds: [],
    createdBy: 'u-zhaoliu',
    executionMode: 'agent',
    agentId: 'a-ops',
    skillIds: ['sk-script'],
    executionPrompt: '请生成 CDN 缓存配置脚本并执行。',
    dueDate: '2026-09-22',
    workItems: [wi('缓存策略脚本', true), wi('配置生效验证', true)],
    activities: [
      act('u-zhaoliu', '创建任务。', daysAgo(10)),
      act('u-zhaoliu', '配置完成并验证通过。', daysAgo(6, 16), 'a-ops')
    ],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(6, 16)
  },

  /* ---------- 资产管理平台 ---------- */
  {
    id: 't-dev-130',
    code: 'DEV-130',
    projectId: 'p-asset',
    title: '资产台账模块开发',
    description: '实现资产台账 CRUD 与批量导入。',
    type: 'development',
    status: 'in_progress',
    priority: 'P1',
    assigneeId: 'u-sunqi',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-refactor'],
    executionPrompt: '请根据当前任务要求完成开发，遵循项目研发规范。',
    dueDate: '2026-10-07',
    workItems: [wi('台账模型', true), wi('批量导入'), wi('单元测试')],
    activities: [
      act('u-wang', '创建任务。', daysAgo(6)),
      act('u-sunqi', '台账模型开发完成。', hoursAgo(7), 'a-dev')
    ],
    createdAt: daysAgo(6),
    updatedAt: hoursAgo(7)
  },
  {
    id: 't-dev-131',
    code: 'DEV-131',
    projectId: 'p-asset',
    title: '资产审批流开发',
    description: '实现资产领用、调拨、报废审批流。',
    type: 'development',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-zhouba',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-14',
    workItems: [wi('审批流设计'), wi('审批接口开发')],
    activities: [act('u-wang', '创建任务。', daysAgo(3))],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
  },
  {
    id: 't-tst-304',
    code: 'TST-304',
    projectId: 'p-asset',
    title: '资产模块测试用例',
    description: '生成资产台账与审批流测试用例。',
    type: 'test',
    status: 'in_progress',
    priority: 'P2',
    assigneeId: 'u-zhouba',
    memberIds: [],
    createdBy: 'u-zhouba',
    executionMode: 'agent',
    agentId: 'a-test',
    skillIds: ['sk-testcase'],
    executionPrompt: '请基于需求文档生成测试用例。',
    dueDate: '2026-10-10',
    workItems: [wi('台账用例', true), wi('审批流用例')],
    activities: [
      act('u-zhouba', '创建任务。', daysAgo(2)),
      act('u-zhouba', '台账用例已生成 24 条。', hoursAgo(6), 'a-test')
    ],
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(6)
  },
  {
    id: 't-qa-403',
    code: 'QA-403',
    projectId: 'p-asset',
    title: '资产平台 SQL 合规审核',
    description: '对资产平台数据库变更脚本执行 SQL 合规审核。',
    type: 'quality',
    status: 'review',
    priority: 'P2',
    assigneeId: 'u-sunqi',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-quality',
    skillIds: ['sk-sql-audit'],
    executionPrompt: '请对变更脚本执行 SQL 合规审核。',
    dueDate: '2026-09-30',
    workItems: [wi('脚本扫描', true), wi('问题清单', true)],
    activities: [
      act('u-wang', '创建任务。', daysAgo(2)),
      act('u-sunqi', '审核完成，发现 2 个性能隐患。', hoursAgo(3), 'a-quality')
    ],
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(3)
  },

  /* ---------- 数据治理平台 ---------- */
  {
    id: 't-dev-140',
    code: 'DEV-140',
    projectId: 'p-data',
    title: '数据质量规则引擎',
    description: '实现数据质量规则配置与校验引擎。',
    type: 'development',
    status: 'in_progress',
    priority: 'P1',
    assigneeId: 'u-zhouba',
    memberIds: ['u-sunqi'],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-refactor'],
    executionPrompt: '请根据当前任务要求完成开发，遵循项目研发规范。',
    dueDate: '2026-10-11',
    workItems: [wi('规则模型', true), wi('校验执行器'), wi('结果上报')],
    activities: [
      act('u-wang', '创建任务。', daysAgo(4)),
      act('u-zhouba', '规则模型开发完成。', hoursAgo(9), 'a-dev')
    ],
    createdAt: daysAgo(4),
    updatedAt: hoursAgo(9)
  },
  {
    id: 't-req-204',
    code: 'REQ-204',
    projectId: 'p-data',
    title: '数据治理需求分析',
    description: '梳理数据治理范围，输出需求分析文档。',
    type: 'requirement',
    status: 'done',
    priority: 'P2',
    assigneeId: 'u-wang',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-req',
    skillIds: ['sk-req-split'],
    executionPrompt: '请拆解需求并输出分析文档。',
    dueDate: '2026-09-19',
    workItems: [wi('范围梳理', true), wi('需求文档', true)],
    activities: [
      act('u-wang', '创建任务。', daysAgo(16)),
      act('u-wang', '需求分析完成。', daysAgo(13, 11), 'a-req')
    ],
    createdAt: daysAgo(16),
    updatedAt: daysAgo(13, 11)
  },
  {
    id: 't-dep-503',
    code: 'DEP-503',
    projectId: 'p-data',
    title: '数据平台环境部署',
    description: '部署数据治理平台至测试环境。',
    type: 'deployment',
    status: 'failed',
    priority: 'P2',
    assigneeId: 'u-sunqi',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-deploy',
    skillIds: ['sk-deploy-cfg'],
    executionPrompt: '请生成部署配置并执行部署。',
    dueDate: '2026-09-28',
    workItems: [wi('部署配置', true), wi('环境部署', true), wi('部署校验')],
    activities: [
      act('u-wang', '创建任务。', daysAgo(5)),
      act('u-sunqi', '执行失败：单元测试未通过，3 个测试失败。', daysAgo(1, 9), 'a-deploy'),
      act('u-wang', '驳回重做：请修复部署脚本中的环境变量引用问题后重新执行。', daysAgo(1, 8))
    ],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1, 8)
  },

  /* ---------- 统一认证中心 ---------- */
  {
    id: 't-dev-150',
    code: 'DEV-150',
    projectId: 'p-auth',
    title: 'SSO 单点登录对接',
    description: '完成统一认证中心与业务系统的 SSO 对接。',
    type: 'development',
    status: 'in_progress',
    priority: 'P0',
    assigneeId: 'u-sunqi',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-dev',
    skillIds: ['sk-static-review'],
    executionPrompt: '请根据当前任务要求完成开发，遵循项目研发规范，并生成必要的单元测试。',
    dueDate: '2026-09-30',
    workItems: [wi('OAuth2 对接', true), wi('OIDC 对接'), wi('联调验证')],
    activities: [
      act('u-wang', '创建任务。', daysAgo(6)),
      act('u-sunqi', 'OAuth2 对接完成。', hoursAgo(4), 'a-dev')
    ],
    createdAt: daysAgo(6),
    updatedAt: hoursAgo(4)
  },
  {
    id: 't-qa-404',
    code: 'QA-404',
    projectId: 'p-auth',
    title: '认证中心安全评审',
    description: '对统一认证中心执行安全专项评审。',
    type: 'quality',
    status: 'review',
    priority: 'P1',
    assigneeId: 'u-zhouba',
    memberIds: [],
    createdBy: 'u-wang',
    executionMode: 'agent',
    agentId: 'a-quality',
    skillIds: ['sk-static-review', 'sk-tech-review'],
    executionPrompt: '请执行安全专项评审。',
    dueDate: '2026-09-30',
    workItems: [wi('安全扫描', true), wi('评审报告', true)],
    activities: [
      act('u-wang', '创建任务。', daysAgo(3)),
      act('u-zhouba', '评审完成，待人工确认。', hoursAgo(2), 'a-quality')
    ],
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(2)
  },

  /* ---------- 移动办公平台 ---------- */
  {
    id: 't-dev-160',
    code: 'DEV-160',
    projectId: 'p-mobile',
    title: '移动审批页开发',
    description: '开发移动端审批列表与审批详情页。',
    type: 'development',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-zhangsan',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'human',
    skillIds: [],
    executionPrompt: '',
    dueDate: '2026-10-16',
    workItems: [wi('审批列表页'), wi('审批详情页')],
    activities: [act('u-li', '创建任务。', daysAgo(2))],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },

  /* ---------- 知识库平台 ---------- */
  {
    id: 't-req-205',
    code: 'REQ-205',
    projectId: 'p-kb',
    title: '知识库平台需求规划',
    description: '规划知识库平台一期需求范围。',
    type: 'requirement',
    status: 'todo',
    priority: 'P2',
    assigneeId: 'u-wangwu',
    memberIds: [],
    createdBy: 'u-li',
    executionMode: 'agent',
    agentId: 'a-req',
    skillIds: ['sk-req-split'],
    executionPrompt: '请拆解需求并输出规划文档。',
    dueDate: '2026-10-09',
    workItems: [wi('需求范围梳理')],
    activities: [act('u-li', '创建任务。', daysAgo(1))],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1)
  }
]

/* ================= 执行记录 ================= */
export const mockExecutions: ExecutionRecord[] = [
  {
    id: 'ex-01',
    agentId: 'a-dev',
    taskId: 't-dev-102',
    projectId: 'p-cs',
    status: 'success',
    summary: 'DEV-102 知识库查询接口开发',
    duration: '2m 38s',
    filesChanged: 3,
    filesAdded: 1,
    testsPassed: 12,
    testsFailed: 0,
    time: minsAgo(18)
  },
  {
    id: 'ex-02',
    agentId: 'a-quality',
    taskId: 't-qa-402',
    projectId: 'p-eff',
    status: 'success',
    summary: 'QA-402 效能平台代码评审',
    duration: '1m 52s',
    filesChanged: 0,
    filesAdded: 1,
    testsPassed: 0,
    testsFailed: 0,
    time: hoursAgo(1)
  },
  {
    id: 'ex-03',
    agentId: 'a-quality',
    taskId: 't-qa-401',
    projectId: 'p-cs',
    status: 'success',
    summary: 'QA-401 客服系统代码静态评审',
    duration: '2m 05s',
    filesChanged: 0,
    filesAdded: 1,
    testsPassed: 0,
    testsFailed: 0,
    time: hoursAgo(2)
  },
  {
    id: 'ex-04',
    agentId: 'a-quality',
    taskId: 't-qa-404',
    projectId: 'p-auth',
    status: 'success',
    summary: 'QA-404 认证中心安全评审',
    duration: '3m 12s',
    filesChanged: 0,
    filesAdded: 1,
    testsPassed: 0,
    testsFailed: 0,
    time: hoursAgo(2)
  },
  {
    id: 'ex-05',
    agentId: 'a-test',
    taskId: 't-tst-301',
    projectId: 'p-cs',
    status: 'success',
    summary: 'TST-301 知识库模块测试用例设计',
    duration: '1m 47s',
    filesChanged: 0,
    filesAdded: 2,
    testsPassed: 0,
    testsFailed: 0,
    time: hoursAgo(4)
  },
  {
    id: 'ex-06',
    agentId: 'a-dev',
    taskId: 't-dev-110',
    projectId: 'p-eff',
    status: 'success',
    summary: 'DEV-110 任务调度服务开发',
    duration: '4m 21s',
    filesChanged: 5,
    filesAdded: 2,
    testsPassed: 18,
    testsFailed: 0,
    time: hoursAgo(6)
  },
  {
    id: 'ex-07',
    agentId: 'a-test',
    taskId: 't-tst-304',
    projectId: 'p-asset',
    status: 'success',
    summary: 'TST-304 资产模块测试用例',
    duration: '1m 38s',
    filesChanged: 0,
    filesAdded: 2,
    testsPassed: 0,
    testsFailed: 0,
    time: hoursAgo(6)
  },
  {
    id: 'ex-08',
    agentId: 'a-dev',
    taskId: 't-dev-130',
    projectId: 'p-asset',
    status: 'success',
    summary: 'DEV-130 资产台账模块开发',
    duration: '3m 44s',
    filesChanged: 4,
    filesAdded: 1,
    testsPassed: 15,
    testsFailed: 0,
    time: hoursAgo(7)
  },
  {
    id: 'ex-09',
    agentId: 'a-dev',
    taskId: 't-dev-140',
    projectId: 'p-data',
    status: 'success',
    summary: 'DEV-140 数据质量规则引擎',
    duration: '5m 02s',
    filesChanged: 6,
    filesAdded: 2,
    testsPassed: 21,
    testsFailed: 0,
    time: hoursAgo(9)
  },
  {
    id: 'ex-10',
    agentId: 'a-dev',
    taskId: 't-dev-150',
    projectId: 'p-auth',
    status: 'success',
    summary: 'DEV-150 SSO 单点登录对接',
    duration: '4m 56s',
    filesChanged: 3,
    filesAdded: 1,
    testsPassed: 14,
    testsFailed: 0,
    time: hoursAgo(4)
  },
  {
    id: 'ex-11',
    agentId: 'a-deploy',
    taskId: 't-dep-503',
    projectId: 'p-data',
    status: 'failed',
    summary: 'DEP-503 数据平台环境部署',
    duration: '2m 10s',
    filesChanged: 2,
    filesAdded: 0,
    testsPassed: 9,
    testsFailed: 3,
    time: daysAgo(1, 9)
  },
  {
    id: 'ex-12',
    agentId: 'a-dev',
    taskId: 't-dev-098',
    projectId: 'p-cs',
    status: 'success',
    summary: 'DEV-098 用户权限接口开发',
    duration: '3m 26s',
    filesChanged: 3,
    filesAdded: 1,
    testsPassed: 12,
    testsFailed: 0,
    time: daysAgo(1, 20)
  },
  {
    id: 'ex-13',
    agentId: 'a-req',
    taskId: 't-req-202',
    projectId: 'p-eff',
    status: 'success',
    summary: 'REQ-202 效能平台需求规格说明书',
    duration: '2m 48s',
    filesChanged: 0,
    filesAdded: 1,
    testsPassed: 0,
    testsFailed: 0,
    time: daysAgo(16, 14)
  },
  {
    id: 'ex-14',
    agentId: 'a-dev',
    taskId: 't-dev-101',
    projectId: 'p-cs',
    status: 'success',
    summary: 'DEV-101 登录接口开发',
    duration: '2m 59s',
    filesChanged: 2,
    filesAdded: 1,
    testsPassed: 10,
    testsFailed: 0,
    time: daysAgo(2, 15)
  },
  {
    id: 'ex-15',
    agentId: 'a-ops',
    taskId: 't-ops-602',
    projectId: 'p-portal',
    status: 'success',
    summary: 'OPS-602 门户 CDN 缓存配置',
    duration: '1m 22s',
    filesChanged: 1,
    filesAdded: 1,
    testsPassed: 0,
    testsFailed: 0,
    time: daysAgo(6, 16)
  }
]

/* ================= 交付物 ================= */
const codeContent = (name: string, task: string) =>
  `## ${name}\n\n> 关联任务：${task}\n\n\`\`\`\n// 由 Development Agent 生成\n// 遵循《DSH 软件工程统一研发规范》\n\nfunc ${name}() {\n    // 核心实现\n}\n\`\`\`\n\n- 单元测试：全部通过\n- 静态评审：无高危问题`

const docContent = (name: string, task: string) =>
  `## ${name}\n\n> 关联任务：${task}\n\n### 1. 背景\n\n本交付物由智能体依据任务要求自动生成，并经人工审核确认。\n\n### 2. 内容概要\n\n- 覆盖任务全部验收标准\n- 符合《DSH 软件工程统一研发规范》文档要求\n- 已归档至项目交付物目录\n\n### 3. 审核记录\n\n| 审核人 | 结论 | 时间 |\n| --- | --- | --- |\n| 李经理 | 通过 | 2026-09-28 |`

const testContent = (name: string, task: string) =>
  `## ${name}\n\n> 关联任务：${task}\n\n| 用例编号 | 场景 | 预期结果 | 状态 |\n| --- | --- | --- | --- |\n| TC-001 | 正常查询 | 返回数据列表 | 通过 |\n| TC-002 | 空关键词 | 返回全量分页 | 通过 |\n| TC-003 | 分页边界 | 边界值正确 | 通过 |\n| TC-004 | 分类过滤 | 仅返回匹配分类 | 通过 |\n| TC-005 | 超长关键词 | 正常截断处理 | 通过 |`

const reportContent = (name: string, task: string) =>
  `## ${name}\n\n> 关联任务：${task}\n\n### 评审结论\n\n**通过（附建议）**\n\n### 问题清单\n\n| 等级 | 位置 | 问题描述 | 修复建议 |\n| --- | --- | --- | --- |\n| 中 | service.go:42 | 未处理空指针 | 增加 nil 判断 |\n| 低 | repo.go:18 | SQL 缺少索引提示 | 补充索引说明 |\n\n### 总体评价\n\n代码结构清晰，符合统一研发规范，建议修复中等级问题后合并。`

const scriptContent = (name: string, task: string) =>
  `## ${name}\n\n> 关联任务：${task}\n\n\`\`\`bash\n#!/usr/bin/env bash\nset -euo pipefail\n\n# 由 Operation Agent 生成\nENV=staging\nkubectl apply -f deploy/\${ENV}/\nkubectl rollout status deploy/app -n \${ENV}\n\`\`\`\n\n- 风险提示：执行前请确认目标环境\n- 回滚方案：kubectl rollout undo`

export const mockDeliverables: Deliverable[] = [
  {
    id: 'dl-01',
    projectId: 'p-cs',
    taskId: 't-dev-102',
    name: '知识库查询接口实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: minsAgo(18),
    content: codeContent('knowledge_query.go', 'DEV-102 实现知识库查询接口')
  },
  {
    id: 'dl-02',
    projectId: 'p-cs',
    taskId: 't-dev-098',
    name: '用户权限接口实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: daysAgo(1, 20),
    content: codeContent('permission_service.go', 'DEV-098 用户权限接口开发')
  },
  {
    id: 'dl-03',
    projectId: 'p-cs',
    taskId: 't-dev-101',
    name: '登录接口实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: daysAgo(2, 15),
    content: codeContent('auth_controller.go', 'DEV-101 登录接口开发')
  },
  {
    id: 'dl-04',
    projectId: 'p-cs',
    taskId: 't-req-201',
    name: '客服对话流程需求规格说明书',
    type: 'doc',
    authorId: 'a-req',
    createdAt: daysAgo(12, 10),
    content: docContent('客服对话流程需求规格说明书', 'REQ-201 客服对话流程需求分析')
  },
  {
    id: 'dl-05',
    projectId: 'p-cs',
    taskId: 't-tst-301',
    name: '知识库模块测试用例',
    type: 'test',
    authorId: 'a-test',
    createdAt: hoursAgo(4),
    content: testContent('知识库模块测试用例', 'TST-301 知识库模块测试用例设计')
  },
  {
    id: 'dl-06',
    projectId: 'p-cs',
    taskId: 't-qa-401',
    name: '客服系统静态评审报告',
    type: 'report',
    authorId: 'a-quality',
    createdAt: hoursAgo(2),
    content: reportContent('客服系统静态评审报告', 'QA-401 客服系统代码静态评审')
  },
  {
    id: 'dl-07',
    projectId: 'p-eff',
    taskId: 't-dev-110',
    name: '任务调度服务实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: hoursAgo(6),
    content: codeContent('scheduler_service.go', 'DEV-110 任务调度服务开发')
  },
  {
    id: 'dl-08',
    projectId: 'p-eff',
    taskId: 't-req-202',
    name: '效能平台需求规格说明书',
    type: 'doc',
    authorId: 'a-req',
    createdAt: daysAgo(16, 14),
    content: docContent('研发效能平台需求规格说明书', 'REQ-202 效能平台需求规格说明书')
  },
  {
    id: 'dl-09',
    projectId: 'p-eff',
    taskId: 't-qa-402',
    name: '效能平台代码评审报告',
    type: 'report',
    authorId: 'a-quality',
    createdAt: hoursAgo(1),
    content: reportContent('效能平台代码评审报告', 'QA-402 效能平台代码评审')
  },
  {
    id: 'dl-10',
    projectId: 'p-portal',
    taskId: 't-req-203',
    name: '门户改版需求确认单',
    type: 'doc',
    authorId: 'u-li',
    createdAt: daysAgo(14),
    content: docContent('门户改版需求确认单', 'REQ-203 门户改版需求确认')
  },
  {
    id: 'dl-11',
    projectId: 'p-portal',
    taskId: 't-ops-602',
    name: 'CDN 缓存配置脚本',
    type: 'script',
    authorId: 'a-ops',
    createdAt: daysAgo(6, 16),
    content: scriptContent('cdn-cache.sh', 'OPS-602 门户 CDN 缓存配置')
  },
  {
    id: 'dl-12',
    projectId: 'p-asset',
    taskId: 't-dev-130',
    name: '资产台账模块实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: hoursAgo(7),
    content: codeContent('asset_ledger_service.go', 'DEV-130 资产台账模块开发')
  },
  {
    id: 'dl-13',
    projectId: 'p-asset',
    taskId: 't-tst-304',
    name: '资产模块测试用例',
    type: 'test',
    authorId: 'a-test',
    createdAt: hoursAgo(6),
    content: testContent('资产模块测试用例', 'TST-304 资产模块测试用例')
  },
  {
    id: 'dl-14',
    projectId: 'p-asset',
    taskId: 't-qa-403',
    name: 'SQL 合规审核报告',
    type: 'report',
    authorId: 'a-quality',
    createdAt: hoursAgo(3),
    content: reportContent('资产平台 SQL 合规审核报告', 'QA-403 资产平台 SQL 合规审核')
  },
  {
    id: 'dl-15',
    projectId: 'p-data',
    taskId: 't-dev-140',
    name: '数据质量规则引擎实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: hoursAgo(9),
    content: codeContent('quality_rule_engine.go', 'DEV-140 数据质量规则引擎')
  },
  {
    id: 'dl-16',
    projectId: 'p-data',
    taskId: 't-req-204',
    name: '数据治理需求分析文档',
    type: 'doc',
    authorId: 'a-req',
    createdAt: daysAgo(13, 11),
    content: docContent('数据治理需求分析文档', 'REQ-204 数据治理需求分析')
  },
  {
    id: 'dl-17',
    projectId: 'p-data',
    taskId: 't-dep-503',
    name: '数据平台部署脚本',
    type: 'script',
    authorId: 'a-deploy',
    createdAt: daysAgo(1, 9),
    content: scriptContent('deploy-data.sh', 'DEP-503 数据平台环境部署')
  },
  {
    id: 'dl-18',
    projectId: 'p-auth',
    taskId: 't-dev-150',
    name: 'SSO 对接实现',
    type: 'code',
    authorId: 'a-dev',
    createdAt: hoursAgo(4),
    content: codeContent('sso_oauth2.go', 'DEV-150 SSO 单点登录对接')
  },
  {
    id: 'dl-19',
    projectId: 'p-auth',
    taskId: 't-qa-404',
    name: '认证中心安全评审报告',
    type: 'report',
    authorId: 'a-quality',
    createdAt: hoursAgo(2),
    content: reportContent('统一认证中心安全评审报告', 'QA-404 认证中心安全评审')
  },
  {
    id: 'dl-20',
    projectId: 'p-mobile',
    taskId: 't-dev-160',
    name: '移动审批页原型说明',
    type: 'doc',
    authorId: 'u-li',
    createdAt: daysAgo(2),
    content: docContent('移动审批页原型说明', 'DEV-160 移动审批页开发')
  }
]
