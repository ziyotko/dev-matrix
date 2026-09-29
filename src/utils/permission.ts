import type { Project, Task, User } from '@/types'

/**
 * 权限统一封装
 *
 * 核心原则：
 * - 能看 ≠ 能编辑 ≠ 能执行 ≠ 能删除
 * - 删除：只能删除自己创建的内容（强规则）
 * - 查看：上级可以看下级；同团队可以互相看
 */

/** 获取用户的所有下属（递归） */
export function getSubordinates(user: User, allUsers: User[]): User[] {
  const result: User[] = []
  const walk = (managerId: string) => {
    allUsers
      .filter((u) => u.managerId === managerId)
      .forEach((u) => {
        result.push(u)
        walk(u.id)
      })
  }
  walk(user.id)
  return result
}

/** 当前用户是否能看到该用户（本人 / 下属 / 上级） */
export function canSeeUser(currentUser: User, target: User, allUsers: User[]): boolean {
  if (currentUser.id === target.id) return true
  if (getSubordinates(currentUser, allUsers).some((u) => u.id === target.id)) return true
  // 上级可见
  let m = currentUser.managerId
  while (m) {
    if (m === target.id) return true
    const manager = allUsers.find((u) => u.id === m)
    m = manager?.managerId ?? null
  }
  return false
}

/** 项目关系（相对当前用户） */
export function getProjectRelation(
  currentUser: User,
  project: Project,
  allUsers: User[]
): 'created' | 'member' | 'team' | 'subordinate' | null {
  if (project.createdBy === currentUser.id) return 'created'
  if (project.memberIds.includes(currentUser.id)) return 'member'
  // 同团队：同部门
  if (project.deptId === currentUser.deptId) return 'team'
  // 下级项目：项目成员/负责人/创建人是当前用户的下属
  const subs = getSubordinates(currentUser, allUsers)
  const subIds = subs.map((u) => u.id)
  const related = [project.ownerId, project.createdBy, ...project.memberIds]
  if (related.some((id) => subIds.includes(id))) return 'subordinate'
  return null
}

/**
 * 能否查看项目
 * - 自己是创建人 / 成员
 * - 同部门
 * - 上级看下级（项目相关人员是自己的下属）
 */
export function canViewProject(
  currentUser: User,
  project: Project,
  allUsers: User[]
): boolean {
  return getProjectRelation(currentUser, project, allUsers) !== null
}

/**
 * 能否编辑项目
 * - 自己是负责人或创建人
 * - 上级可以编辑下级项目（领导可管理）
 */
export function canEditProject(
  currentUser: User,
  project: Project,
  allUsers: User[]
): boolean {
  if (project.ownerId === currentUser.id || project.createdBy === currentUser.id) return true
  // 上级可编辑下级项目
  const subs = getSubordinates(currentUser, allUsers).map((u) => u.id)
  return subs.includes(project.ownerId) || subs.includes(project.createdBy)
}

/**
 * 能否删除项目（强规则：只能删除自己创建的）
 */
export function canDeleteProject(currentUser: User, project: Project): boolean {
  return project.createdBy === currentUser.id
}

/**
 * 能否查看任务
 * - 能查看任务所属项目
 */
export function canViewTask(
  currentUser: User,
  task: Task,
  project: Project | undefined,
  allUsers: User[]
): boolean {
  if (!project) return false
  return canViewProject(currentUser, project, allUsers)
}

/**
 * 能否编辑任务
 * - 自己是负责人 / 创建人 / 协作成员
 * - 上级可编辑下级任务
 */
export function canEditTask(
  currentUser: User,
  task: Task,
  allUsers: User[]
): boolean {
  const related = [task.assigneeId, task.createdBy, ...task.memberIds]
  if (related.includes(currentUser.id)) return true
  const subs = getSubordinates(currentUser, allUsers).map((u) => u.id)
  return related.some((id) => subs.includes(id))
}

/**
 * 能否执行任务（触发智能体执行）
 * - 自己是负责人 / 创建人
 */
export function canExecuteTask(currentUser: User, task: Task): boolean {
  return task.assigneeId === currentUser.id || task.createdBy === currentUser.id
}

/**
 * 能否删除任务（强规则：只能删除自己创建的）
 */
export function canDeleteTask(currentUser: User, task: Task): boolean {
  return task.createdBy === currentUser.id
}

/** 关系标签文案 */
export const relationLabel: Record<string, string> = {
  created: '我创建的',
  member: '我参与的',
  team: '同团队',
  subordinate: '下级项目'
}
