<script setup lang="ts">
import { computed } from 'vue'
import type { Project, ProjectRelation } from '@/types'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { projectColor, relativeTime } from '@/utils'
import { relationLabel } from '@/utils/permission'
import Avatar from './Avatar.vue'
import StatusDot from './StatusDot.vue'

const props = defineProps<{
  project: Project
  relation: ProjectRelation
}>()

defineEmits<{ open: [project: Project] }>()

const appStore = useAppStore()
const userStore = useUserStore()

const owner = computed(() => userStore.getUser(props.project.ownerId))
const progress = computed(() => appStore.projectProgress(props.project.id))
const taskCount = computed(
  () => appStore.tasks.filter((t) => t.projectId === props.project.id).length
)
const updatedAt = computed(() => appStore.projectUpdatedAt(props.project.id))

const projectStatus = computed(() =>
  props.project.status === 'active' ? 'in_progress' : props.project.status === 'done' ? 'done' : 'todo'
)
</script>

<template>
  <div class="project-row" @click="$emit('open', project)">
    <div class="p-name">
      <span class="p-icon" :style="{ background: projectColor(project.key) }">
        {{ project.key.charAt(0) }}
      </span>
      <span class="p-text">
        <div class="p-title">{{ project.name }}</div>
        <div class="p-key">{{ project.key }}</div>
      </span>
    </div>
    <div class="p-owner">
      <Avatar v-if="owner" :name="owner.name" :color="owner.color" :size="20" />
      <span>{{ owner?.name }}</span>
    </div>
    <span class="relation-tag" :class="{ created: relation === 'created' }">
      {{ relationLabel[relation] }}
    </span>
    <div class="p-progress">
      <div class="progress-bar">
        <div class="bar" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="p-pct">{{ progress }}%</span>
    </div>
    <span class="p-tasks">{{ taskCount }}</span>
    <StatusDot :status="projectStatus" />
    <span class="p-updated">{{ relativeTime(updatedAt) }}</span>
  </div>
</template>
