<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { projectColor, relativeTime } from '@/utils'
import { canViewProject } from '@/utils/permission'
import TaskRow from '@/components/TaskRow.vue'
import NewTaskDrawer from '@/components/NewTaskDrawer.vue'
import type { Task } from '@/types'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

/** 我的任务：分配给我 或 我创建的 */
const myTasks = computed(() =>
  appStore.tasks.filter(
    (t) => t.assigneeId === currentUser.value.id || t.createdBy === currentUser.value.id
  )
)

const countBy = (status: Task['status']) => myTasks.value.filter((t) => t.status === status).length

/** 我的任务列表（按更新时间倒序，最多 8 条） */
const myTaskList = computed(() =>
  [...myTasks.value]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
)

/** 最近项目 */
const recentProjects = computed(() =>
  appStore.projects
    .filter((p) => canViewProject(currentUser.value, p, userStore.users))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)
)

/** 智能体动态（最近执行记录） */
const agentFeed = computed(() => appStore.executions.slice(0, 5))

const drawerVisible = ref(false)

const openTask = (t: Task) => router.push(`/tasks/${t.id}`)
const openTaskById = (id: string) => router.push(`/tasks/${id}`)
const openProject = (id: string) => router.push(`/projects/${id}`)
</script>

<template>
  <div>
    <!-- 顶部问候 -->
    <div class="greeting">
      <div>
        <h1>{{ greeting }}，{{ currentUser.name }}</h1>
        <div class="g-sub">{{ currentUser.title }} · {{ userStore.deptName(currentUser.deptId) }}</div>
      </div>
      <div class="g-actions">
        <el-button type="primary" @click="drawerVisible = true">
          <span style="margin-right: 4px">+</span>新建任务
        </el-button>
      </div>
    </div>

    <!-- 我的工作 -->
    <div class="mywork-row">
      <div class="mywork-card" @click="router.push('/tasks')">
        <span class="mw-dot" style="background: #9ca3af"></span>
        <span class="mw-num">{{ countBy('todo') }}</span>
        <span class="mw-label">待处理</span>
      </div>
      <div class="mywork-card" @click="router.push('/tasks')">
        <span class="mw-dot" style="background: #2563eb"></span>
        <span class="mw-num">{{ countBy('in_progress') }}</span>
        <span class="mw-label">进行中</span>
      </div>
      <div class="mywork-card" @click="router.push('/tasks')">
        <span class="mw-dot" style="background: #d97706"></span>
        <span class="mw-num">{{ countBy('review') }}</span>
        <span class="mw-label">待审核</span>
      </div>
    </div>

    <!-- 我的任务 -->
    <div class="panel">
      <div class="panel-head">
        <span class="ph-title">我的任务</span>
        <el-link type="primary" :underline="false" @click="router.push('/tasks')">查看全部</el-link>
      </div>
      <div class="panel-body flush">
        <template v-if="myTaskList.length">
          <TaskRow
            v-for="t in myTaskList"
            :key="t.id"
            :task="t"
            :show-project="true"
            @open="openTask"
          />
        </template>
        <div v-else class="empty-state">
          <div class="es-icon">📋</div>
          暂无任务，点击右上角「新建任务」开始
        </div>
      </div>
    </div>

    <!-- 最近项目 -->
    <div class="panel section-gap">
      <div class="panel-head">
        <span class="ph-title">最近项目</span>
        <el-link type="primary" :underline="false" @click="router.push('/projects')">全部项目</el-link>
      </div>
      <div class="panel-body flush">
        <div
          v-for="p in recentProjects"
          :key="p.id"
          class="wb-project"
          @click="openProject(p.id)"
        >
          <span class="wp-icon" :style="{ background: projectColor(p.key) }">{{ p.key.charAt(0) }}</span>
          <div class="wp-main">
            <div class="wp-name">{{ p.name }}</div>
            <div class="wp-key">{{ p.key }}</div>
          </div>
          <div class="wp-progress">
            <div class="progress-bar">
              <div class="bar" :style="{ width: appStore.projectProgress(p.id) + '%' }"></div>
            </div>
            <span class="wp-pct">{{ appStore.projectProgress(p.id) }}%</span>
          </div>
          <span class="wp-tasks">{{ appStore.projectTasks(p.id).length }} 个任务</span>
        </div>
      </div>
    </div>

    <!-- 智能体动态 -->
    <div class="panel section-gap">
      <div class="panel-head">
        <span class="ph-title">智能体动态</span>
        <span class="ph-extra">AI 正在参与研发工作</span>
      </div>
      <div class="panel-body flush">
        <div v-for="ex in agentFeed" :key="ex.id" class="feed-item">
          <span class="fd-icon" :style="{ background: appStore.getAgent(ex.agentId)?.color }">AI</span>
          <div class="fd-body">
            <div class="fd-top">
              <span class="fd-agent">{{ appStore.getAgent(ex.agentId)?.name }}</span>
              <span :style="{ color: ex.status === 'success' ? '#16a34a' : '#dc2626', fontSize: '12px' }">
                {{ ex.status === 'success' ? '刚刚完成' : '执行失败' }}：
              </span>
              <span class="fd-time">{{ relativeTime(ex.time) }}</span>
            </div>
            <div class="fd-content">
              <span class="fd-task" @click.stop="openTaskById(ex.taskId)">{{ ex.summary }}</span>
            </div>
            <div class="fd-stats">
              <span v-if="ex.filesChanged || ex.filesAdded">
                生成文件 {{ ex.filesChanged + ex.filesAdded }}
              </span>
              <span v-if="ex.testsPassed || ex.testsFailed" :class="ex.testsFailed ? 'err' : 'ok'">
                测试通过 {{ ex.testsPassed }}/{{ ex.testsPassed + ex.testsFailed }}
              </span>
              <el-link type="primary" :underline="false" style="font-size: 12px" @click.stop="openTaskById(ex.taskId)">
                查看结果
              </el-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <NewTaskDrawer v-model="drawerVisible" @created="(id) => router.push(`/tasks/${id}`)" />
  </div>
</template>

<style scoped>
.wb-project {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 160px 90px;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.1s;
}

.wb-project:last-child {
  border-bottom: none;
}

.wb-project:hover {
  background: #fafbfc;
}

.wp-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.wp-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
}

.wp-key {
  font-size: 11px;
  color: var(--text-3);
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.wp-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wp-pct {
  font-size: 11px;
  color: var(--text-2);
  width: 30px;
  text-align: right;
}

.wp-tasks {
  font-size: 12px;
  color: var(--text-3);
  text-align: right;
}
</style>
