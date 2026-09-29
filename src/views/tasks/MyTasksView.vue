<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import TaskRow from '@/components/TaskRow.vue'
import NewTaskDrawer from '@/components/NewTaskDrawer.vue'
import type { Task } from '@/types'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)

type FilterKey = 'all' | 'assigned' | 'created' | 'in_progress' | 'review' | 'done'

const filter = ref<FilterKey>('all')

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'assigned', label: '分配给我' },
  { key: 'created', label: '我创建的' },
  { key: 'in_progress', label: '进行中' },
  { key: 'review', label: '待审核' },
  { key: 'done', label: '已完成' }
]

const baseTasks = computed(() =>
  appStore.tasks.filter(
    (t) => t.assigneeId === currentUser.value.id || t.createdBy === currentUser.value.id
  )
)

const countOf = (key: FilterKey) => {
  switch (key) {
    case 'all':
      return baseTasks.value.length
    case 'assigned':
      return baseTasks.value.filter((t) => t.assigneeId === currentUser.value.id).length
    case 'created':
      return baseTasks.value.filter((t) => t.createdBy === currentUser.value.id).length
    case 'in_progress':
      return baseTasks.value.filter((t) => t.status === 'in_progress').length
    case 'review':
      return baseTasks.value.filter((t) => t.status === 'review').length
    case 'done':
      return baseTasks.value.filter((t) => t.status === 'done').length
  }
}

const visibleTasks = computed(() => {
  let list = baseTasks.value
  switch (filter.value) {
    case 'assigned':
      list = list.filter((t) => t.assigneeId === currentUser.value.id)
      break
    case 'created':
      list = list.filter((t) => t.createdBy === currentUser.value.id)
      break
    case 'in_progress':
      list = list.filter((t) => t.status === 'in_progress')
      break
    case 'review':
      list = list.filter((t) => t.status === 'review')
      break
    case 'done':
      list = list.filter((t) => t.status === 'done')
      break
  }
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})

const drawerVisible = ref(false)
const openTask = (t: Task) => router.push(`/tasks/${t.id}`)
</script>

<template>
  <div>
    <div class="page-head">
      <div class="ph-main">
        <h1>我的任务</h1>
        <div class="ph-sub">分配给我或我创建的任务</div>
      </div>
      <div class="ph-actions">
        <el-button type="primary" @click="drawerVisible = true">
          <span style="margin-right: 4px">+</span>新建任务
        </el-button>
      </div>
    </div>

    <div class="filter-tabs">
      <div
        v-for="f in filters"
        :key="f.key"
        class="filter-tab"
        :class="{ active: filter === f.key }"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span class="ft-count">{{ countOf(f.key) }}</span>
      </div>
    </div>

    <div class="task-list">
      <TaskRow
        v-for="t in visibleTasks"
        :key="t.id"
        :task="t"
        :show-project="true"
        @open="openTask"
      />
      <div v-if="!visibleTasks.length" class="empty-state">
        <div class="es-icon">📋</div>
        该筛选条件下暂无任务
      </div>
    </div>

    <NewTaskDrawer v-model="drawerVisible" @created="(id) => router.push(`/tasks/${id}`)" />
  </div>
</template>

<style scoped>
.ft-count {
  font-size: 11px;
  color: var(--text-3);
  margin-left: 4px;
}

.filter-tab.active .ft-count {
  color: var(--primary);
}
</style>
