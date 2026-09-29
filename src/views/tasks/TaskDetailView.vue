<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { canDeleteTask, canEditTask, canExecuteTask, canViewTask } from '@/utils/permission'
import { dueDateLabel, isOverdue, relativeTime, renderMarkdown } from '@/utils'
import Avatar from '@/components/Avatar.vue'
import StatusDot from '@/components/StatusDot.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const taskId = computed(() => route.params.id as string)
const task = computed(() => appStore.getTask(taskId.value))
const project = computed(() => (task.value ? appStore.getProject(task.value.projectId) : undefined))
const currentUser = computed(() => userStore.currentUser)

const agent = computed(() => (task.value?.agentId ? appStore.getAgent(task.value.agentId) : undefined))
const skills = computed(() =>
  task.value ? task.value.skillIds.map((id) => appStore.getSkill(id)).filter(Boolean) : []
)

const assignee = computed(() => (task.value ? userStore.getUser(task.value.assigneeId) : undefined))
const creator = computed(() => (task.value ? userStore.getUser(task.value.createdBy) : undefined))
const members = computed(() =>
  task.value
    ? task.value.memberIds.map((id) => userStore.getUser(id)).filter(Boolean)
    : []
)

const typeLabel: Record<string, string> = {
  requirement: '需求',
  development: '开发',
  quality: '质量',
  test: '测试',
  deployment: '部署',
  operation: '运维'
}

/* ================= 智能体执行模拟 ================= */
type ExecState = 'idle' | 'running' | 'success' | 'failed'

const execState = ref<ExecState>('idle')
const execSteps = ref<string[]>([])
const currentStep = ref(0)
const execResult = ref<{
  filesChanged: number
  filesAdded: number
  testsPassed: number
  testsFailed: number
  files: { name: string; type: 'add' | 'mod' }[]
} | null>(null)

const execRequirements = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

const STEP_POOL = [
  '加载项目上下文',
  '加载研发规范',
  '加载项目 Skill',
  '分析任务与拆解工作项',
  '正在修改代码',
  '执行单元测试',
  '生成交付物'
]

const isFailureTask = computed(() => task.value?.id === 't-dep-503')

const defaultRequirement = computed(() => {
  if (!task.value) return ''
  return `请按照项目研发规范完成「${task.value.title}」，确保单元测试全部通过，并生成接口文档与代码注释。`
})

watch(
  () => task.value?.id,
  () => {
    stopTimer()
    execState.value = 'idle'
    execSteps.value = []
    currentStep.value = 0
    execResult.value = null
    execRequirements.value = defaultRequirement.value
  },
  { immediate: true }
)

onBeforeUnmount(() => stopTimer())

function stopTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function startExecution() {
  if (!task.value || !agent.value) return
  if (execState.value === 'running') return

  stopTimer()
  execState.value = 'running'
  execSteps.value = [...STEP_POOL]
  currentStep.value = 0
  execResult.value = null

  // 任务进入进行中
  appStore.setTaskStatus(task.value.id, 'in_progress', currentUser.value.id, '开始执行')

  // 智能体状态置为执行中
  const agentObj = appStore.getAgent(agent.value.id)
  if (agentObj) agentObj.status = 'running'

  runNextStep()
}

function runNextStep() {
  if (!task.value || !agent.value) return
  if (currentStep.value >= execSteps.value.length) {
    finishExecution()
    return
  }
  const delay = 500 + Math.random() * 500
  timer = setTimeout(() => {
    currentStep.value += 1
    runNextStep()
  }, delay)
}

function finishExecution() {
  if (!task.value || !agent.value) return
  stopTimer()

  const fail = isFailureTask.value
  const files = [
    { name: 'knowledge_controller.go', type: 'mod' as const },
    { name: 'knowledge_service.go', type: 'mod' as const },
    { name: 'knowledge_repo.go', type: 'mod' as const },
    { name: 'knowledge_service_test.go', type: 'add' as const }
  ]

  if (fail) {
    execState.value = 'failed'
    execResult.value = {
      filesChanged: 2,
      filesAdded: 1,
      testsPassed: 9,
      testsFailed: 3,
      files: files.slice(0, 3)
    }
    appStore.setTaskStatus(task.value.id, 'failed', currentUser.value.id, '执行失败：单元测试未通过，3 个测试失败')
    appStore.addExecution({
      agentId: agent.value.id,
      taskId: task.value.id,
      projectId: task.value.projectId,
      status: 'failed',
      summary: task.value.title,
      duration: '42s',
      filesChanged: 2,
      filesAdded: 1,
      testsPassed: 9,
      testsFailed: 3,
      time: new Date().toISOString()
    })
    const agentObj = appStore.getAgent(agent.value.id)
    if (agentObj) agentObj.status = 'idle'
  } else {
    execState.value = 'success'
    execResult.value = {
      filesChanged: 3,
      filesAdded: 1,
      testsPassed: 12,
      testsFailed: 0,
      files
    }
    appStore.setTaskStatus(task.value.id, 'review', currentUser.value.id, '执行完成，等待人工审核')
    appStore.addExecution({
      agentId: agent.value.id,
      taskId: task.value.id,
      projectId: task.value.projectId,
      status: 'success',
      summary: task.value.title,
      duration: '38s',
      filesChanged: 3,
      filesAdded: 1,
      testsPassed: 12,
      testsFailed: 0,
      time: new Date().toISOString()
    })
    appStore.addDeliverable({
      projectId: task.value.projectId,
      taskId: task.value.id,
      name: `${task.value.title} · 交付物`,
      type: 'code',
      authorId: agent.value.id,
      createdAt: new Date().toISOString(),
      content:
        '## 交付物说明\n\n- 新增知识库查询接口 `/api/knowledge/query`\n- 接入向量检索，支持语义相似度排序\n- 补充单元测试 12 个，全部通过\n\n### 变更文件\n\n| 文件 | 类型 |\n| --- | --- |\n| knowledge_controller.go | 修改 |\n| knowledge_service.go | 修改 |\n| knowledge_repo.go | 修改 |\n| knowledge_service_test.go | 新增 |'
    })
    const agentObj = appStore.getAgent(agent.value.id)
    if (agentObj) agentObj.status = 'idle'
  }
}

/* ================= 人工审核 ================= */
const reviewVisible = computed(() => task.value?.status === 'review')

const approve = () => {
  if (!task.value) return
  appStore.setTaskStatus(task.value.id, 'done', currentUser.value.id, '人工审核通过')
  execState.value = 'idle'
  ElMessage.success('审核通过，任务已完成')
}

const reject = async () => {
  if (!task.value) return
  try {
    const { value } = await ElMessageBox.prompt('请填写修改意见，智能体将据此重新执行', '驳回重做', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：向量检索需要支持多字段加权',
      type: 'warning'
    })
    const comment = value?.trim() || '请优化实现'
    appStore.addActivity(task.value.id, currentUser.value.id, `驳回重做：${comment}`, agent.value?.id)
    startExecution()
  } catch {
    /* 取消 */
  }
}

/* ================= 工作项 ================= */
const newWorkItem = ref('')
const addWorkItem = () => {
  if (!task.value || !newWorkItem.value.trim()) return
  appStore.addWorkItem(task.value.id, newWorkItem.value.trim())
  newWorkItem.value = ''
}

/* ================= 变更 / 日志 Drawer ================= */
const diffVisible = ref(false)
const logVisible = ref(false)

const diffLines = [
  { type: 'hunk', text: '@@ -12,6 +12,18 @@ func (c *KnowledgeController) Query' },
  { type: 'ctx', text: ' func (c *KnowledgeController) Query(w http.ResponseWriter, r *http.Request) {' },
  { type: 'add', text: '  req := &QueryRequest{}' },
  { type: 'add', text: '  if err := json.NewDecoder(r.Body).Decode(req); err != nil {' },
  { type: 'add', text: '    http.Error(w, err.Error(), http.StatusBadRequest)' },
  { type: 'add', text: '    return' },
  { type: 'add', text: '  }' },
  { type: 'ctx', text: '  results, err := c.svc.Search(r.Context(), req.Query, req.TopK)' },
  { type: 'del', text: '  if err != nil {' },
  { type: 'add', text: '  if err != nil {' },
  { type: 'add', text: '    c.logger.Error("search failed", "err", err)' },
  { type: 'ctx', text: '    http.Error(w, "internal error", http.StatusInternalServerError)' },
  { type: 'ctx', text: '    return' },
  { type: 'ctx', text: '  }' },
  { type: 'add', text: '  w.Header().Set("Content-Type", "application/json")' },
  { type: 'add', text: '  json.NewEncoder(w).Encode(results)' }
]

const logLines = [
  { type: 'info', text: '[00:00.012] 初始化执行环境，加载项目上下文' },
  { type: 'info', text: '[00:00.048] 读取研发规范 DSH-SE-STD v1.0' },
  { type: 'info', text: '[00:00.091] 加载 Skill：测试用例生成、静态代码审查' },
  { type: 'info', text: '[00:01.204] 分析任务：实现知识库查询接口' },
  { type: 'info', text: '[00:02.113] 拆解工作项：Controller / Service / 向量检索 / 单元测试' },
  { type: 'ok', text: '[00:05.882] 修改 knowledge_controller.go（+12 -1）' },
  { type: 'ok', text: '[00:08.447] 修改 knowledge_service.go（+34 -6）' },
  { type: 'ok', text: '[00:11.020] 修改 knowledge_repo.go（+18 -2）' },
  { type: 'ok', text: '[00:14.556] 新增 knowledge_service_test.go（+96）' },
  { type: 'info', text: '[00:16.003] 执行单元测试 go test ./...' },
  { type: 'ok', text: '[00:38.210] 测试通过 12/12，耗时 22.2s' },
  { type: 'ok', text: '[00:38.402] 生成交付物与接口文档，执行完成' }
]

const failLogLines = [
  { type: 'info', text: '[00:00.012] 初始化执行环境，加载项目上下文' },
  { type: 'info', text: '[00:01.204] 分析任务：数据同步部署脚本' },
  { type: 'ok', text: '[00:05.882] 修改 deploy_sync.sh（+8 -2）' },
  { type: 'ok', text: '[00:08.447] 修改 sync_config.yaml（+12 -0）' },
  { type: 'info', text: '[00:16.003] 执行单元测试 go test ./...' },
  { type: 'err', text: '[00:42.118] 测试失败 3/12：TestSyncRetry、TestSyncTimeout、TestSyncIdempotent' },
  { type: 'err', text: '[00:42.120] 执行失败：单元测试未通过' }
]

/* ================= 删除任务 ================= */
const deleteTask = async () => {
  if (!task.value) return
  try {
    await ElMessageBox.confirm(`确定删除任务「${task.value.title}」？`, '删除任务', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    appStore.deleteTask(task.value.id)
    ElMessage.success('任务已删除')
    router.push('/tasks')
  } catch {
    /* 取消 */
  }
}

const openProject = () => {
  if (project.value) router.push(`/projects/${project.value.id}`)
}
</script>

<template>
  <div v-if="task">
    <!-- 不可见提示 -->
    <div
      v-if="!canViewTask(currentUser, task, project, userStore.users)"
      class="empty-state"
      style="padding: 80px 0"
    >
      <div class="es-icon">🔒</div>
      你没有权限查看该任务
    </div>

    <template v-else>
      <!-- 面包屑 -->
      <div class="td-breadcrumb">
        <span class="bc-link" @click="openProject">
          <span v-if="project" class="bc-project">
            {{ project.name }}
          </span>
        </span>
        <span class="bc-sep">/</span>
        <span class="bc-current">{{ task.code }}</span>
      </div>

      <div class="task-detail-layout">
        <!-- 左列 -->
        <div class="tdl-left">
          <!-- 任务头部 -->
          <div class="task-detail-head">
            <div class="tdh-top">
              <div style="flex: 1; min-width: 0">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
                  <span class="tdh-code">{{ task.code }}</span>
                  <span class="tdh-title">{{ task.title }}</span>
                  <StatusDot :status="task.status" />
                  <span class="priority" :class="task.priority">{{ task.priority }}</span>
                  <span class="tdh-type">{{ typeLabel[task.type] }}</span>
                  <span v-if="task.executionMode === 'agent'" class="agent-flag">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1.5a1 1 0 0 1 1 1v1h2.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2H7v-1a1 1 0 0 1 1-1z"/></svg>
                    智能体执行
                  </span>
                </div>
              </div>
              <div style="display: flex; gap: 8px; flex-shrink: 0">
                <el-dropdown trigger="click">
                  <el-button>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-if="canEditTask(currentUser, task, userStore.users)"
                        @click="ElMessage.info('演示版：任务编辑暂未开放')"
                      >
                        编辑任务
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="canDeleteTask(currentUser, task)"
                        divided
                        style="color: #dc2626"
                        @click="deleteTask"
                      >
                        删除任务
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="tdh-meta">
              <span class="meta-item">
                负责人：
                <Avatar v-if="assignee" :name="assignee.name" :color="assignee.color" :size="18" />
                {{ assignee?.name }}
              </span>
              <span class="meta-item">创建人：{{ creator?.name }}</span>
              <span class="meta-item" :class="{ overdue: isOverdue(task.dueDate) }">
                截止：{{ dueDateLabel(task.dueDate) }}
              </span>
              <span class="meta-item">更新于 {{ relativeTime(task.updatedAt) }}</span>
            </div>
          </div>

          <!-- 描述 -->
          <div class="panel">
            <div class="panel-head">
              <span class="ph-title">描述</span>
            </div>
            <div class="panel-body">
              <div class="md-view" v-html="renderMarkdown(task.description)"></div>
            </div>
          </div>

          <!-- 工作项 -->
          <div class="panel section-gap">
            <div class="panel-head">
              <span class="ph-title">工作项（{{ task.workItems.filter((w) => w.done).length }}/{{ task.workItems.length }}）</span>
            </div>
            <div class="panel-body">
              <div class="workitem-list">
                <div
                  v-for="w in task.workItems"
                  :key="w.id"
                  class="workitem"
                  :class="{ done: w.done }"
                  @click="canEditTask(currentUser, task, userStore.users) && appStore.toggleWorkItem(task.id, w.id)"
                >
                  <span class="wi-box">
                    <svg v-if="w.done" viewBox="0 0 16 16" width="12" height="12" fill="#fff"><path d="M6.5 10.5 3.5 7.5 4.9 6.1l1.6 1.6 4-4L11.9 5z"/></svg>
                  </span>
                  <span class="wi-text">{{ w.title }}</span>
                </div>
              </div>
              <div class="wi-add">
                <el-input
                  v-model="newWorkItem"
                  placeholder="添加工作项，回车确认"
                  size="small"
                  @keyup.enter="addWorkItem"
                />
              </div>
            </div>
          </div>

          <!-- 活动 -->
          <div class="panel section-gap">
            <div class="panel-head">
              <span class="ph-title">活动</span>
            </div>
            <div class="panel-body flush">
              <div v-for="a in [...task.activities].reverse()" :key="a.id" class="activity-item">
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
                  </div>
                  <div class="ai-content">{{ a.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右列 -->
        <div class="tdl-right">
          <!-- 智能体工作区 -->
          <div v-if="task.executionMode === 'agent' && agent" class="agent-workspace">
            <div class="aw-head">
              <Avatar :name="agent.name" :color="agent.color" :size="30" agent />
              <div style="flex: 1; min-width: 0">
                <div class="aw-name">{{ agent.cnName }}</div>
                <div class="aw-sub">{{ agent.name }}</div>
              </div>
              <StatusDot :agent-status="agent.status" />
            </div>

            <div class="aw-body">
              <!-- 能力 -->
              <div class="aw-section">
                <div class="aw-section-title">智能体能力</div>
                <div class="cap-list">
                  <div v-for="cap in agent.capabilities" :key="cap" class="cap-item">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M6.5 10.5 3.5 7.5 4.9 6.1l1.6 1.6 4-4L11.9 5z"/></svg>
                    {{ cap }}
                  </div>
                </div>
              </div>

              <!-- 使用 Skill -->
              <div v-if="skills.length" class="aw-section">
                <div class="aw-section-title">使用 Skill</div>
                <div class="skill-chips">
                  <span v-for="s in skills" :key="s!.id" class="skill-chip">
                    {{ s!.name }}
                    <span v-if="s!.status === 'planned'" class="sc-planned">规划中</span>
                  </span>
                </div>
              </div>

              <!-- 执行要求 -->
              <div class="aw-section">
                <div class="aw-section-title">执行要求</div>
                <el-input
                  v-model="execRequirements"
                  type="textarea"
                  :rows="3"
                  placeholder="描述对智能体的执行要求"
                />
              </div>

              <!-- 执行按钮 -->
              <div class="aw-section">
                <el-button
                  v-if="canExecuteTask(currentUser, task)"
                  type="primary"
                  :loading="execState === 'running'"
                  :disabled="execState === 'running'"
                  style="width: 100%"
                  @click="startExecution"
                >
                  <template v-if="execState !== 'running'">
                    <span style="margin-right: 6px">▶</span>
                    {{ execState === 'idle' ? '开始执行' : '重新执行' }}
                  </template>
                  <template v-else>执行中…</template>
                </el-button>
                <div v-else class="aw-no-perm">仅负责人或创建人可触发执行</div>
              </div>

              <!-- 执行步骤 -->
              <div v-if="execState === 'running'" class="aw-section">
                <div class="aw-section-title">执行进度</div>
                <div class="exec-steps">
                  <div
                    v-for="(step, i) in execSteps"
                    :key="i"
                    class="exec-step"
                    :class="{ done: i < currentStep, active: i === currentStep }"
                  >
                    <span class="es-icon">
                      <svg v-if="i < currentStep" viewBox="0 0 16 16" width="12" height="12" fill="#16a34a"><path d="M6.5 10.5 3.5 7.5 4.9 6.1l1.6 1.6 4-4L11.9 5z"/></svg>
                      <span v-else-if="i === currentStep" class="spinner"></span>
                      <span v-else class="es-dot"></span>
                    </span>
                    <span class="es-text">{{ step }}</span>
                  </div>
                </div>
              </div>

              <!-- 执行结果 -->
              <div v-if="execState === 'success' && execResult" class="aw-section">
                <div class="exec-result success">
                  <div class="er-head">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="#16a34a"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM6.5 10.5 3.5 7.5 4.9 6.1l1.6 1.6 4-4L11.9 5z"/></svg>
                    执行完成
                  </div>
                  <div class="er-body">
                    <div class="er-stats">
                      <div class="ers-item">
                        <div class="ers-num">{{ execResult.filesChanged }}</div>
                        <div class="ers-label">修改文件</div>
                      </div>
                      <div class="ers-item">
                        <div class="ers-num">{{ execResult.filesAdded }}</div>
                        <div class="ers-label">新增文件</div>
                      </div>
                      <div class="ers-item">
                        <div class="ers-num ok">{{ execResult.testsPassed }}/{{ execResult.testsPassed + execResult.testsFailed }}</div>
                        <div class="ers-label">测试通过</div>
                      </div>
                    </div>
                    <div class="file-list">
                      <div v-for="f in execResult.files" :key="f.name" class="file-item" :class="f.type === 'add' ? 'f-add' : 'f-mod'">
                        <span class="fi-badge">{{ f.type === 'add' ? 'A' : 'M' }}</span>
                        {{ f.name }}
                      </div>
                    </div>
                    <div class="er-actions">
                      <el-button size="small" @click="diffVisible = true">查看变更</el-button>
                      <el-button size="small" @click="logVisible = true">查看日志</el-button>
                      <el-button size="small" @click="startExecution">重新执行</el-button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 失败结果 -->
              <div v-if="execState === 'failed' && execResult" class="aw-section">
                <div class="exec-result failed">
                  <div class="er-head">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="#dc2626"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5.8 5.8 8 8l2.2-2.2 1.4 1.4L9.4 8l2.2 2.2-1.4 1.4L8 9.4 5.8 11.6 4.4 10.2 6.6 8 4.4 5.8z"/></svg>
                    执行失败
                  </div>
                  <div class="er-body">
                    <div class="er-stats">
                      <div class="ers-item">
                        <div class="ers-num">{{ execResult.filesChanged + execResult.filesAdded }}</div>
                        <div class="ers-label">变更文件</div>
                      </div>
                      <div class="ers-item">
                        <div class="ers-num err">{{ execResult.testsFailed }}</div>
                        <div class="ers-label">测试失败</div>
                      </div>
                    </div>
                    <div class="er-msg">单元测试未通过，{{ execResult.testsFailed }} 个测试失败。请查看日志定位问题后重新执行。</div>
                    <div class="er-actions">
                      <el-button size="small" @click="logVisible = true">查看日志</el-button>
                      <el-button size="small" type="primary" @click="startExecution">重新执行</el-button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 人工审核 -->
              <div v-if="reviewVisible" class="aw-section">
                <div class="review-box">
                  <div class="rb-head">
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="#d97706"><path d="M8 1.5 14 13H2L8 1.5zm0 3.5-1 4h2L8 5zm0 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
                    等待人工确认
                  </div>
                  <div class="rb-text">智能体已完成执行，请审核结果后确认。</div>
                  <div class="rb-actions">
                    <el-button type="primary" size="small" @click="approve">通过</el-button>
                    <el-button size="small" @click="reject">驳回重做</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 人工任务：基础信息 -->
          <div v-else class="agent-workspace">
            <div class="aw-head">
              <div style="flex: 1">
                <div class="aw-name">任务信息</div>
                <div class="aw-sub">人工执行</div>
              </div>
            </div>
            <div class="aw-body">
              <div class="aw-section">
                <div class="aw-section-title">负责人</div>
                <div class="info-row">
                  <Avatar v-if="assignee" :name="assignee.name" :color="assignee.color" :size="26" />
                  <div>
                    <div class="ir-name">{{ assignee?.name }}</div>
                    <div class="ir-sub">{{ assignee?.title }}</div>
                  </div>
                </div>
              </div>
              <div v-if="members.length" class="aw-section">
                <div class="aw-section-title">协作成员</div>
                <div class="info-row" v-for="m in members" :key="m!.id">
                  <Avatar :name="m!.name" :color="m!.color" :size="26" />
                  <div>
                    <div class="ir-name">{{ m!.name }}</div>
                    <div class="ir-sub">{{ m!.title }}</div>
                  </div>
                </div>
              </div>
              <div class="aw-section">
                <div class="aw-section-title">时间</div>
                <div class="kv-row"><span>创建</span><span>{{ relativeTime(task.createdAt) }}</span></div>
                <div class="kv-row"><span>更新</span><span>{{ relativeTime(task.updatedAt) }}</span></div>
                <div class="kv-row"><span>截止</span><span :class="{ overdue: isOverdue(task.dueDate) }">{{ dueDateLabel(task.dueDate) }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 变更 Drawer -->
      <el-drawer v-model="diffVisible" title="代码变更" size="640px">
        <div class="diff-view">
          <div v-for="(line, i) in diffLines" :key="i" class="diff-line" :class="line.type">
            <span class="dl-sign">{{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : line.type === 'hunk' ? '@' : ' ' }}</span>
            <span class="dl-text">{{ line.text }}</span>
          </div>
        </div>
      </el-drawer>

      <!-- 日志 Drawer -->
      <el-drawer v-model="logVisible" title="执行日志" size="640px">
        <div class="log-view">
          <div
            v-for="(line, i) in (execState === 'failed' ? failLogLines : logLines)"
            :key="i"
            class="log-line"
            :class="line.type"
          >
            {{ line.text }}
          </div>
        </div>
      </el-drawer>
    </template>
  </div>

  <div v-else class="empty-state" style="padding: 80px 0">
    <div class="es-icon">📋</div>
    任务不存在
  </div>
</template>

<style scoped>
.td-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-2);
  margin-bottom: 12px;
}

.bc-link {
  cursor: pointer;
  color: var(--text-2);
}

.bc-link:hover {
  color: var(--primary);
}

.bc-sep {
  color: var(--text-3);
}

.bc-current {
  color: var(--text-1);
  font-weight: 500;
}

.tdh-code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 13px;
  color: var(--text-2);
}

.tdh-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-1);
}

.tdh-type {
  font-size: 11px;
  color: var(--text-2);
  background: #f3f4f6;
  padding: 1px 8px;
  border-radius: 4px;
}

.agent-flag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--primary);
  background: #eef2ff;
  padding: 1px 8px;
  border-radius: 4px;
}

.tdh-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-2);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meta-item.overdue {
  color: #dc2626;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-1);
  background: #f3f4f6;
  padding: 3px 9px;
  border-radius: 4px;
}

.sc-planned {
  font-size: 10px;
  color: #d97706;
  background: #fef3c7;
  padding: 0 5px;
  border-radius: 3px;
}

.aw-no-perm {
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
  padding: 4px 0;
}

.er-msg {
  font-size: 12px;
  color: var(--text-2);
  margin: 10px 0;
  line-height: 1.5;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.ir-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
}

.ir-sub {
  font-size: 11px;
  color: var(--text-2);
}

.kv-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-2);
  padding: 5px 0;
  border-bottom: 1px solid var(--border-light);
}

.kv-row:last-child {
  border-bottom: none;
}

.kv-row .overdue {
  color: #dc2626;
}
</style>
