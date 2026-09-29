import { defineStore } from 'pinia'
import {
  mockAgents,
  mockDeliverables,
  mockExecutions,
  mockProjects,
  mockSkills,
  mockTasks
} from '@/mock/data'
import type {
  Agent,
  Deliverable,
  ExecutionRecord,
  Project,
  Skill,
  Task,
  TaskStatus
} from '@/types'
import { uid } from '@/utils'

const STORAGE_KEY = 'devmatrix-demo-data-v1'

interface PersistedData {
  projects: Project[]
  tasks: Task[]
  deliverables: Deliverable[]
  executions: ExecutionRecord[]
}

function loadPersisted(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as PersistedData
    if (!Array.isArray(data.projects) || !Array.isArray(data.tasks)) return null
    return data
  } catch {
    return null
  }
}

function persist(
  projects: Project[],
  tasks: Task[],
  deliverables: Deliverable[],
  executions: ExecutionRecord[]
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ projects, tasks, deliverables, executions })
    )
  } catch {
    /* 忽略存储异常 */
  }
}

/** 业务数据 store（项目 / 任务 / 交付物 / 执行记录），带 localStorage 持久化 */
export const useAppStore = defineStore('app', {
  state: () => {
    const saved = loadPersisted()
    return {
      projects: saved?.projects ?? mockProjects,
      tasks: saved?.tasks ?? mockTasks,
      agents: mockAgents as Agent[],
      skills: mockSkills as Skill[],
      deliverables: saved?.deliverables ?? mockDeliverables,
      executions: saved?.executions ?? mockExecutions
    }
  },
  getters: {
    getProject(state): (id: string) => Project | undefined {
      return (id: string) => state.projects.find((p) => p.id === id)
    },
    getTask(state): (id: string) => Task | undefined {
      return (id: string) => state.tasks.find((t) => t.id === id)
    },
    getAgent(state): (id: string) => Agent | undefined {
      return (id: string) => state.agents.find((a) => a.id === id)
    },
    getSkill(state): (id: string) => Skill | undefined {
      return (id: string) => state.skills.find((s) => s.id === id)
    },
    projectTasks(state): (projectId: string) => Task[] {
      return (projectId: string) =>
        state.tasks.filter((t) => t.projectId === projectId)
    },
    projectProgress(state): (projectId: string) => number {
      return (projectId: string) => {
        const tasks = state.tasks.filter((t) => t.projectId === projectId)
        if (tasks.length === 0) return 0
        const done = tasks.filter((t) => t.status === 'done').length
        return Math.round((done / tasks.length) * 100)
      }
    },
    /** 项目最近更新时间（取任务与项目自身更新时间的最大值） */
    projectUpdatedAt(state): (projectId: string) => string {
      return (projectId: string) => {
        const p = state.projects.find((x) => x.id === projectId)
        if (!p) return ''
        const times = [p.updatedAt, ...state.tasks.filter((t) => t.projectId === projectId).map((t) => t.updatedAt)]
        return times.sort().reverse()[0]
      }
    }
  },
  actions: {
    save() {
      persist(this.projects, this.tasks, this.deliverables, this.executions)
    },

    /* ---------- 项目 ---------- */
    addProject(data: {
      name: string
      key: string
      description: string
      ownerId: string
      deptId: string
      memberIds: string[]
    }): Project {
      const now = new Date().toISOString()
      const project: Project = {
        id: uid('p'),
        name: data.name,
        key: data.key,
        description: data.description,
        status: 'active',
        ownerId: data.ownerId,
        createdBy: data.ownerId,
        deptId: data.deptId as Project['deptId'],
        memberIds: data.memberIds,
        createdAt: now,
        updatedAt: now
      }
      this.projects.unshift(project)
      this.save()
      return project
    },

    deleteProject(id: string) {
      this.projects = this.projects.filter((p) => p.id !== id)
      this.tasks = this.tasks.filter((t) => t.projectId !== id)
      this.deliverables = this.deliverables.filter((d) => d.projectId !== id)
      this.save()
    },

    /* ---------- 任务 ---------- */
    nextTaskCode(projectId: string): string {
      const project = this.projects.find((p) => p.id === projectId)
      const prefix = project?.key ?? 'DEV'
      const nums = this.tasks
        .filter((t) => t.projectId === projectId)
        .map((t) => parseInt(t.code.split('-')[1] ?? '0', 10))
        .filter((n) => !Number.isNaN(n))
      const next = (nums.length ? Math.max(...nums) : 100) + 1
      return `${prefix}-${next}`
    },

    addTask(data: Omit<Task, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'workItems' | 'activities'> & {
      workItems?: Task['workItems']
    }): Task {
      const now = new Date().toISOString()
      const task: Task = {
        ...data,
        id: uid('t'),
        code: this.nextTaskCode(data.projectId),
        workItems: data.workItems ?? [],
        activities: [
          {
            id: uid('act'),
            actorId: data.createdBy,
            content:
              data.executionMode === 'agent'
                ? '创建任务，执行方式：智能体执行。'
                : '创建任务，执行方式：人工执行。',
            time: now
          }
        ],
        createdAt: now,
        updatedAt: now
      }
      this.tasks.unshift(task)
      this.save()
      return task
    },

    deleteTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
      this.save()
    },

    updateTask(id: string, patch: Partial<Task>) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      Object.assign(task, patch, { updatedAt: new Date().toISOString() })
      this.save()
    },

    setTaskStatus(id: string, status: TaskStatus, actorId: string, note?: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      task.status = status
      task.updatedAt = new Date().toISOString()
      task.activities.push({
        id: uid('act'),
        actorId,
        content: note ?? `状态变更为「${statusLabel(status)}」。`,
        time: new Date().toISOString()
      })
      this.save()
    },

    addWorkItem(taskId: string, title: string) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (!task) return
      task.workItems.push({ id: uid('wi'), title, done: false })
      task.updatedAt = new Date().toISOString()
      this.save()
    },

    toggleWorkItem(taskId: string, workItemId: string) {
      const task = this.tasks.find((t) => t.id === taskId)
      const item = task?.workItems.find((w) => w.id === workItemId)
      if (!task || !item) return
      item.done = !item.done
      task.updatedAt = new Date().toISOString()
      this.save()
    },

    addActivity(taskId: string, actorId: string, content: string, agentId?: string) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (!task) return
      task.activities.push({
        id: uid('act'),
        actorId,
        agentId,
        content,
        time: new Date().toISOString()
      })
      task.updatedAt = new Date().toISOString()
      this.save()
    },

    /* ---------- 执行记录 / 交付物 ---------- */
    addExecution(record: Omit<ExecutionRecord, 'id'>): ExecutionRecord {
      const rec: ExecutionRecord = { ...record, id: uid('ex') }
      this.executions.unshift(rec)
      this.save()
      return rec
    },

    addDeliverable(data: Omit<Deliverable, 'id'>): Deliverable {
      const d: Deliverable = { ...data, id: uid('dl') }
      this.deliverables.unshift(d)
      this.save()
      return d
    },

    /** 重置演示数据 */
    resetData() {
      localStorage.removeItem(STORAGE_KEY)
      this.projects = mockProjects
      this.tasks = mockTasks
      this.deliverables = mockDeliverables
      this.executions = mockExecutions
    }
  }
})

function statusLabel(s: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: '待处理',
    in_progress: '进行中',
    review: '待审核',
    done: '已完成',
    failed: '失败'
  }
  return map[s]
}
