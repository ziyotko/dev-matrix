<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { dueDateLabel, isOverdue } from '@/utils'
import Avatar from './Avatar.vue'
import StatusDot from './StatusDot.vue'

const props = defineProps<{
  task: Task
  /** 是否显示项目名 */
  showProject?: boolean
}>()

defineEmits<{ open: [task: Task] }>()

const appStore = useAppStore()
const userStore = useUserStore()

const assignee = computed(() => userStore.getUser(props.task.assigneeId))
const executor = computed(() =>
  props.task.executionMode === 'agent' && props.task.agentId
    ? appStore.getAgent(props.task.agentId)
    : undefined
)
const project = computed(() => appStore.getProject(props.task.projectId))
</script>

<template>
  <div class="task-row" @click="$emit('open', task)">
    <span class="t-code">{{ task.code }}</span>
    <span class="t-title">
      <span v-if="task.executionMode === 'agent'" class="agent-flag" title="智能体执行">AI</span>
      {{ task.title }}
    </span>
    <StatusDot :status="task.status" />
    <span class="priority" :class="task.priority">{{ task.priority }}</span>
    <span class="t-assignee">
      <Avatar v-if="assignee" :name="assignee.name" :color="assignee.color" :size="20" />
      <span v-if="assignee" class="t-person-name">{{ assignee.name }}</span>
    </span>
    <span class="t-executor">
      <Avatar
        v-if="executor"
        :name="executor.name"
        :color="executor.color"
        :size="20"
        agent
      />
      <span v-if="executor" class="t-person-name">{{ executor.cnName }}</span>
    </span>
    <span class="t-due" :class="{ overdue: isOverdue(task.dueDate) && task.status !== 'done' }">
      <template v-if="showProject && project">
        <span class="t-project" :title="project.name">{{ project.name }}</span>
        <span class="t-due-date">{{ dueDateLabel(task.dueDate) }}</span>
      </template>
      <template v-else>{{ dueDateLabel(task.dueDate) }}</template>
    </span>
  </div>
</template>

<style scoped>
.t-project {
  display: block;
  font-size: 11px;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.t-due-date {
  display: block;
  font-size: 11px;
}
</style>
