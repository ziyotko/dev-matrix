<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import type { ExecutionMode, Priority, TaskType } from '@/types'

const props = defineProps<{
  modelValue: boolean
  /** 默认所属项目 */
  defaultProjectId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  created: [taskId: string]
}>()

const appStore = useAppStore()
const userStore = useUserStore()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const form = reactive({
  title: '',
  description: '',
  projectId: '',
  type: 'development' as TaskType,
  assigneeId: '',
  memberIds: [] as string[],
  priority: 'P2' as Priority,
  dueDate: '',
  executionMode: 'human' as ExecutionMode,
  agentId: '',
  skillIds: [] as string[]
})

const typeOptions: { value: TaskType; label: string }[] = [
  { value: 'requirement', label: '需求' },
  { value: 'development', label: '开发' },
  { value: 'quality', label: '质量' },
  { value: 'test', label: '测试' },
  { value: 'deployment', label: '部署' },
  { value: 'operation', label: '运维' }
]

const agentOptions = computed(() =>
  appStore.agents.filter((a) => a.status !== 'unavailable')
)

const skillOptions = computed(() =>
  appStore.skills.filter((s) => s.status === 'online')
)

const projectOptions = computed(() => appStore.projects)

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      form.title = ''
      form.description = ''
      form.projectId = props.defaultProjectId ?? ''
      form.type = 'development'
      form.assigneeId = userStore.currentUser.id
      form.memberIds = []
      form.priority = 'P2'
      form.dueDate = ''
      form.executionMode = 'human'
      form.agentId = ''
      form.skillIds = []
    }
  }
)

const submit = () => {
  if (!form.title.trim()) {
    ElMessage.warning('请填写任务名称')
    return
  }
  if (!form.projectId) {
    ElMessage.warning('请选择所属项目')
    return
  }
  if (form.executionMode === 'agent' && !form.agentId) {
    ElMessage.warning('请选择执行智能体')
    return
  }
  const task = appStore.addTask({
    projectId: form.projectId,
    title: form.title.trim(),
    description: form.description,
    type: form.type,
    status: 'todo',
    priority: form.priority,
    assigneeId: form.assigneeId || userStore.currentUser.id,
    memberIds: form.memberIds,
    createdBy: userStore.currentUser.id,
    executionMode: form.executionMode,
    agentId: form.executionMode === 'agent' ? form.agentId : undefined,
    skillIds: form.executionMode === 'agent' ? form.skillIds : [],
    executionPrompt:
      form.executionMode === 'agent'
        ? '请根据当前任务要求完成开发，遵循项目研发规范，并生成必要的单元测试。'
        : '',
    dueDate: form.dueDate
  })
  ElMessage.success(`任务 ${task.code} 已创建`)
  visible.value = false
  emit('created', task.id)
}
</script>

<template>
  <el-drawer
    v-model="visible"
    title="新建任务"
    size="480px"
    :close-on-click-modal="false"
  >
    <el-form label-position="top" class="nt-form">
      <el-form-item label="任务名称" required>
        <el-input v-model="form.title" placeholder="例如：实现知识库查询接口" maxlength="60" />
      </el-form-item>
      <el-form-item label="任务描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="支持 Markdown 格式描述任务要求"
        />
      </el-form-item>
      <el-form-item label="所属项目" required>
        <el-select v-model="form.projectId" placeholder="选择项目" style="width: 100%">
          <el-option
            v-for="p in projectOptions"
            :key="p.id"
            :label="`${p.name}（${p.key}）`"
            :value="p.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务类型" required>
        <el-select v-model="form.type" style="width: 100%">
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人">
        <el-select v-model="form.assigneeId" style="width: 100%">
          <el-option
            v-for="u in userStore.users"
            :key="u.id"
            :label="`${u.name} · ${u.title}`"
            :value="u.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="协作成员">
        <el-select
          v-model="form.memberIds"
          multiple
          collapse-tags
          placeholder="选择协作成员"
          style="width: 100%"
        >
          <el-option
            v-for="u in userStore.users.filter((x) => x.id !== form.assigneeId)"
            :key="u.id"
            :label="u.name"
            :value="u.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="form.priority" style="width: 100%">
          <el-option label="P0（紧急）" value="P0" />
          <el-option label="P1（高）" value="P1" />
          <el-option label="P2（中）" value="P2" />
          <el-option label="P3（低）" value="P3" />
        </el-select>
      </el-form-item>
      <el-form-item label="截止日期">
        <el-date-picker
          v-model="form.dueDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="执行方式" required>
        <el-radio-group v-model="form.executionMode">
          <el-radio value="human">人工执行</el-radio>
          <el-radio value="agent">智能体执行</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.executionMode === 'agent'">
        <el-form-item label="执行智能体" required>
          <el-select v-model="form.agentId" placeholder="选择智能体" style="width: 100%">
            <el-option
              v-for="a in agentOptions"
              :key="a.id"
              :label="`${a.name} · ${a.cnName}`"
              :value="a.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="使用 Skill">
          <el-select
            v-model="form.skillIds"
            multiple
            collapse-tags
            placeholder="选择要加载的 Skill（可选）"
            style="width: 100%"
          >
            <el-option
              v-for="s in skillOptions"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div class="nt-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">创建任务</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.nt-form {
  padding-right: 4px;
}
.nt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
