/** 用户角色 */
export type UserRole = 'leader' | 'manager' | 'member'

/** 部门 ID */
export type DeptId = 'rd-center' | 'product-rd' | 'platform-rd'

export interface User {
  id: string
  name: string
  title: string
  role: UserRole
  deptId: DeptId
  /** 直接上级用户 ID，顶级为 null */
  managerId: string | null
  /** 头像底色 */
  color: string
}

export interface Dept {
  id: DeptId
  name: string
  parentId: DeptId | null
}

/** 任务状态 */
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'failed'

/** 优先级 */
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'

/** 任务类型（研发领域） */
export type TaskType = 'requirement' | 'development' | 'quality' | 'test' | 'deployment' | 'operation'

/** 执行方式 */
export type ExecutionMode = 'human' | 'agent'

export interface WorkItem {
  id: string
  title: string
  done: boolean
}

export interface Activity {
  id: string
  actorId: string
  /** 智能体执行记录使用 agentId */
  agentId?: string
  content: string
  time: string
}

export interface Task {
  id: string
  /** 任务编号，如 DEV-102 */
  code: string
  projectId: string
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: Priority
  assigneeId: string
  /** 协作成员 */
  memberIds: string[]
  createdBy: string
  /** 执行方式 */
  executionMode: ExecutionMode
  /** 执行智能体 ID（executionMode=agent 时） */
  agentId?: string
  /** 使用的 Skill ID 列表 */
  skillIds: string[]
  /** 执行要求 */
  executionPrompt: string
  dueDate: string
  workItems: WorkItem[]
  activities: Activity[]
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'active' | 'paused' | 'done'

export interface Project {
  id: string
  name: string
  key: string
  description: string
  status: ProjectStatus
  ownerId: string
  createdBy: string
  deptId: DeptId
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

/** 智能体状态 */
export type AgentStatus = 'idle' | 'running' | 'unavailable'

export interface Agent {
  id: string
  name: string
  /** 中文名 */
  cnName: string
  domain: TaskType | 'dispatch'
  description: string
  status: AgentStatus
  todayRuns: number
  successRate: number
  /** 当前能力（Skill 名称列表） */
  capabilities: string[]
  color: string
}

/** Skill 状态 */
export type SkillStatus = 'online' | 'planned'

/** Skill 能力类型 */
export type SkillCapabilityType = '生成类' | '审核类' | '分析类' | '执行类' | '辅助类'

export interface Skill {
  id: string
  name: string
  domain: TaskType | 'dispatch' | 'cross'
  status: SkillStatus
  version: string
  capabilityType: SkillCapabilityType
  description: string
  scene: string
  inputs: string[]
  outputs: string[]
  usageCount: number
}

export type DeliverableType = 'code' | 'doc' | 'test' | 'report' | 'script'

export interface Deliverable {
  id: string
  projectId: string
  taskId: string
  name: string
  type: DeliverableType
  /** 产出者：用户 ID 或智能体 ID */
  authorId: string
  createdAt: string
  /** Mock 预览内容（Markdown） */
  content: string
}

export interface ExecutionRecord {
  id: string
  agentId: string
  taskId: string
  projectId: string
  status: 'success' | 'failed'
  summary: string
  duration: string
  filesChanged: number
  filesAdded: number
  testsPassed: number
  testsFailed: number
  time: string
}

/** 项目关系（相对当前用户） */
export type ProjectRelation = 'created' | 'member' | 'team' | 'subordinate'
