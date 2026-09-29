<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { canDeleteProject, canEditProject, canViewProject } from '@/utils/permission'
import { projectColor, relativeTime, renderMarkdown } from '@/utils'
import Avatar from '@/components/Avatar.vue'
import TaskRow from '@/components/TaskRow.vue'
import NewTaskDrawer from '@/components/NewTaskDrawer.vue'
import StatusDot from '@/components/StatusDot.vue'
import type { Deliverable, Task } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => appStore.getProject(projectId.value))
const currentUser = computed(() => userStore.currentUser)

const activeTab = ref('tasks')
const drawerVisible = ref(false)
const previewDeliverable = ref<Deliverable | null>(null)

watch(
  () => route.params.id,
  () => {
    activeTab.value = 'tasks'
  }
)

const owner = computed(() => (project.value ? userStore.getUser(project.value.ownerId) : undefined))
const creator = computed(() => (project.value ? userStore.getUser(project.value.createdBy) : undefined))
const members = computed(() =>
  project.value
    ? project.value.memberIds.map((id) => userStore.getUser(id)).filter(Boolean)
    : []
)

const tasks = computed(() =>
  project.value
    ? [...appStore.projectTasks(project.value.id)].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      )
    : []
)

const stats = computed(() => {
  const list = tasks.value
  return {
    total: list.length,
    inProgress: list.filter((t) => t.status === 'in_progress').length,
    review: list.filter((t) => t.status === 'review').length,
    done: list.filter((t) => t.status === 'done').length
  }
})

const recentTasks = computed(() => tasks.value.slice(0, 6))

/** 项目最近智能体执行 */
const recentExecutions = computed(() =>
  appStore.executions.filter((e) => e.projectId === projectId.value).slice(0, 5)
)

/** 项目活动（任务活动流汇总） */
const projectActivities = computed(() =>
  tasks.value
    .flatMap((t) => t.activities.map((a) => ({ ...a, task: t })))
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 15)
)

const deliverables = computed(() =>
  appStore.deliverables
    .filter((d) => d.projectId === projectId.value)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
)

const deliverableTypeLabel: Record<string, string> = {
  code: '代码',
  doc: '文档',
  test: '测试',
  report: '报告',
  script: '脚本'
}

const authorName = (id: string) => {
  const agent = appStore.getAgent(id)
  if (agent) return agent.name
  return userStore.getUser(id)?.name ?? '未知'
}

const authorColor = (id: string) => {
  const agent = appStore.getAgent(id)
  if (agent) return agent.color
  return userStore.getUser(id)?.color ?? '#6b7280'
}

const isAgentAuthor = (id: string) => !!appStore.getAgent(id)

const openTask = (t: Task) => router.push(`/tasks/${t.id}`)
const openTaskById = (id: string) => router.push(`/tasks/${id}`)

const deleteProject = async () => {
  if (!project.value) return
  try {
    await ElMessageBox.confirm(
      `确定删除项目「${project.value.name}」？其下所有任务与交付物将一并删除。`,
      '删除项目',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    appStore.deleteProject(project.value.id)
    ElMessage.success('项目已删除')
    router.push('/projects')
  } catch {
    /* 取消 */
  }
}

const previewVisible = computed({
  get: () => previewDeliverable.value !== null,
  set: (v: boolean) => {
    if (!v) previewDeliverable.value = null
  }
})

const preview = (d: Deliverable) => {
  previewDeliverable.value = d
}
</script>

<template>
  <div v-if="project">
    <!-- 不可见项目提示 -->
    <div v-if="!canViewProject(currentUser, project, userStore.users)" class="empty-state" style="padding: 80px 0">
      <div class="es-icon">🔒</div>
      你没有权限查看该项目
    </div>

    <template v-else>
      <!-- 项目头部 -->
      <div class="project-detail-head">
        <div class="pdh-top">
          <span class="pdh-icon" :style="{ background: projectColor(project.key) }">
            {{ project.key.charAt(0) }}
          </span>
          <div style="flex: 1; min-width: 0">
            <div style="display: flex; align-items: center; gap: 10px">
              <span class="pdh-name">{{ project.name }}</span>
              <span class="pdh-key">{{ project.key }}</span>
              <StatusDot :status="project.status === 'active' ? 'in_progress' : project.status === 'done' ? 'done' : 'todo'" />
            </div>
            <div style="font-size: 12px; color: var(--text-2); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
              {{ project.description }}
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-shrink: 0">
            <el-button type="primary" @click="drawerVisible = true">
              <span style="margin-right: 4px">+</span>新建任务
            </el-button>
            <el-dropdown trigger="click">
              <el-button>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="canEditProject(currentUser, project, userStore.users)"
                    @click="ElMessage.info('演示版：项目编辑暂未开放')"
                  >
                    编辑项目
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="canDeleteProject(currentUser, project)"
                    divided
                    style="color: #dc2626"
                    @click="deleteProject"
                  >
                    删除项目
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="pdh-meta">
          <span class="meta-item">
            负责人：
            <Avatar v-if="owner" :name="owner.name" :color="owner.color" :size="18" />
            {{ owner?.name }}
          </span>
          <span class="meta-item">创建人：{{ creator?.name }}</span>
          <span class="meta-item">所属团队：{{ userStore.deptName(project.deptId) }}</span>
          <span class="meta-item">成员：{{ project.memberIds.length }}</span>
          <span class="meta-item">更新于 {{ relativeTime(appStore.projectUpdatedAt(project.id)) }}</span>
        </div>
      </div>

      <!-- 内部导航 -->
      <div class="pd-tabs">
        <div
          v-for="tab in [
            { key: 'overview', label: '概览' },
            { key: 'tasks', label: `任务（${tasks.length}）` },
            { key: 'members', label: '成员' },
            { key: 'deliverables', label: `交付物（${deliverables.length}）` },
            { key: 'activity', label: '活动' }
          ]"
          :key="tab.key"
          class="pd-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 概览 -->
      <div v-if="activeTab === 'overview'">
        <div class="stat-row">
          <div class="stat-card">
            <div class="sc-num">{{ stats.total }}</div>
            <div class="sc-label">总任务</div>
          </div>
          <div class="stat-card">
            <div class="sc-num">{{ stats.inProgress }}</div>
            <div class="sc-label">进行中</div>
          </div>
          <div class="stat-card">
            <div class="sc-num">{{ stats.review }}</div>
            <div class="sc-label">待审核</div>
          </div>
          <div class="stat-card">
            <div class="sc-num">{{ stats.done }}</div>
            <div class="sc-label">已完成</div>
          </div>
        </div>

        <div class="ov-grid">
          <div class="panel">
            <div class="panel-head">
              <span class="ph-title">最近任务</span>
            </div>
            <div class="panel-body flush">
              <TaskRow v-for="t in recentTasks" :key="t.id" :task="t" @open="openTask" />
              <div v-if="!recentTasks.length" class="empty-state">暂无任务</div>
            </div>
          </div>

          <div>
            <div class="panel">
              <div class="panel-head">
                <span class="ph-title">项目成员</span>
              </div>
              <div class="panel-body">
                <div class="member-grid">
                  <div v-for="m in members" :key="m!.id" class="member-card">
                    <Avatar :name="m!.name" :color="m!.color" :size="30" />
                    <div>
                      <div class="mc-name">{{ m!.name }}</div>
                      <div class="mc-title">{{ m!.title }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel section-gap">
              <div class="panel-head">
                <span class="ph-title">最近智能体执行</span>
              </div>
              <div class="panel-body flush">
                <div v-for="ex in recentExecutions" :key="ex.id" class="feed-item">
                  <span class="fd-icon" :style="{ background: appStore.getAgent(ex.agentId)?.color }">AI</span>
                  <div class="fd-body">
                    <div class="fd-top">
                      <span class="fd-agent">{{ appStore.getAgent(ex.agentId)?.name }}</span>
                      <span :style="{ color: ex.status === 'success' ? '#16a34a' : '#dc2626', fontSize: '12px' }">
                        {{ ex.status === 'success' ? '完成' : '失败' }}：
                      </span>
                      <span class="fd-time">{{ relativeTime(ex.time) }}</span>
                    </div>
                    <div class="fd-content">
                      <span class="fd-task" @click.stop="openTaskById(ex.taskId)">{{ ex.summary }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="!recentExecutions.length" class="empty-state">暂无智能体执行记录</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务 -->
      <div v-if="activeTab === 'tasks'">
        <div class="task-list">
          <TaskRow v-for="t in tasks" :key="t.id" :task="t" @open="openTask" />
          <div v-if="!tasks.length" class="empty-state">
            <div class="es-icon">📋</div>
            暂无任务，点击右上角「新建任务」
          </div>
        </div>
      </div>

      <!-- 成员 -->
      <div v-if="activeTab === 'members'">
        <div class="panel">
          <div class="panel-body">
            <div class="member-grid">
              <div v-for="m in members" :key="m!.id" class="member-card">
                <Avatar :name="m!.name" :color="m!.color" :size="34" />
                <div>
                  <div class="mc-name">{{ m!.name }}</div>
                  <div class="mc-title">{{ m!.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 交付物 -->
      <div v-if="activeTab === 'deliverables'">
        <div class="panel">
          <div class="panel-body flush">
            <div
              v-for="d in deliverables"
              :key="d.id"
              class="deliverable-row"
              @click="preview(d)"
            >
              <span class="d-icon">
                <svg v-if="d.type === 'code'" viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5.5 4 1.5 8l4 4 1.2-1.2L4.4 8l2.3-2.8L5.5 4zm5 0-1.2 1.2L11.6 8l-2.3 2.8L10.5 12l4-4-4-4z"/></svg>
                <svg v-else-if="d.type === 'test'" viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M6 1.5h4v1.8h1.5v2H13v1.4H1.5V5.3H5V3.3h1V1.5zM3 9.5h10l-1 5H4l-1-5z"/></svg>
                <svg v-else-if="d.type === 'script'" viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 1.5h10v13H3v-13zm2 3v1.6h6V4.5H5zm0 3.2v1.6h6V7.7H5z"/></svg>
                <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 1.5h7l3 3v10H3v-13zm6.5 1.4v2.6h2.6L9.5 2.9z"/></svg>
              </span>
              <span class="d-name">{{ d.name }}</span>
              <span class="d-task">{{ deliverableTypeLabel[d.type] }}</span>
              <span class="d-author">
                <Avatar :name="authorName(d.authorId)" :color="authorColor(d.authorId)" :size="20" :agent="isAgentAuthor(d.authorId)" />
                <span>{{ authorName(d.authorId) }}</span>
              </span>
              <span class="d-time">{{ relativeTime(d.createdAt) }}</span>
            </div>
            <div v-if="!deliverables.length" class="empty-state">
              <div class="es-icon">📦</div>
              暂无交付物
            </div>
          </div>
        </div>
      </div>

      <!-- 活动 -->
      <div v-if="activeTab === 'activity'">
        <div class="panel">
          <div class="panel-body flush">
            <div v-for="a in projectActivities" :key="a.id" class="activity-item">
              <Avatar
                :name="a.agentId ? appStore.getAgent(a.agentId)?.name ?? '' : userStore.getUser(a.actorId)?.name ?? ''"
                :color="a.agentId ? appStore.getAgent(a.agentId)?.color : userStore.getUser(a.actorId)?.color"
                :size="26"
                :agent="!!a.agentId"
              />
              <div class="ai-body">
                <div class="ai-top">
                  <span class="ai-name">
                    {{ a.agentId ? appStore.getAgent(a.agentId)?.name : userStore.getUser(a.actorId)?.name }}
                  </span>
                  <span class="ai-time">{{ relativeTime(a.time) }}</span>
                  <span class="ai-task" @click="openTask(a.task)">{{ a.task.code }}</span>
                </div>
                <div class="ai-content">{{ a.content }}</div>
              </div>
            </div>
            <div v-if="!projectActivities.length" class="empty-state">暂无活动</div>
          </div>
        </div>
      </div>

      <NewTaskDrawer v-model="drawerVisible" :default-project-id="project.id" />

      <!-- 交付物预览 Drawer -->
      <el-drawer v-model="previewVisible" title="交付物预览" size="560px">
        <template v-if="previewDeliverable">
          <div style="margin-bottom: 12px; font-size: 12px; color: var(--text-2)">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-1); margin-bottom: 6px">
              {{ previewDeliverable.name }}
            </div>
            <div>
              类型：{{ deliverableTypeLabel[previewDeliverable.type] }} ·
              产出：{{ authorName(previewDeliverable.authorId) }} ·
              {{ relativeTime(previewDeliverable.createdAt) }}
            </div>
          </div>
          <div class="md-view" v-html="renderMarkdown(previewDeliverable.content)"></div>
        </template>
      </el-drawer>
    </template>
  </div>

  <div v-else class="empty-state" style="padding: 80px 0">
    <div class="es-icon">📁</div>
    项目不存在
  </div>
</template>

<style scoped>
.pd-tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}

.pd-tab {
  padding: 8px 14px;
  font-size: 13px;
  color: var(--text-2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.12s;
  user-select: none;
}

.pd-tab:hover {
  color: var(--text-1);
}

.pd-tab.active {
  color: var(--primary);
  font-weight: 500;
  border-bottom-color: var(--primary);
}

.ov-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 14px;
  align-items: start;
}

.ai-task {
  font-size: 11px;
  color: var(--primary);
  cursor: pointer;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.ai-task:hover {
  text-decoration: underline;
}

@media (max-width: 1100px) {
  .ov-grid {
    grid-template-columns: 1fr;
  }
}
</style>
