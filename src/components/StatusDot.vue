<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    status?: TaskStatus
    /** 智能体运行状态 */
    agentStatus?: 'idle' | 'running' | 'unavailable'
  }>(),
  { status: 'todo' }
)

const map: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: '待处理', color: '#9ca3af' },
  in_progress: { label: '进行中', color: '#2563eb' },
  review: { label: '待审核', color: '#d97706' },
  done: { label: '已完成', color: '#16a34a' },
  failed: { label: '失败', color: '#dc2626' }
}

const agentMap = {
  idle: { label: '空闲', color: '#16a34a' },
  running: { label: '执行中', color: '#2563eb' },
  unavailable: { label: '不可用', color: '#9ca3af' }
}

const current = computed(() =>
  props.agentStatus ? agentMap[props.agentStatus] : map[props.status]
)
</script>

<template>
  <span class="status-dot">
    <span class="dot" :style="{ background: current.color }"></span>
    {{ current.label }}
  </span>
</template>
