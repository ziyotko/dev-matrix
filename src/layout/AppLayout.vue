<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { canViewProject } from '@/utils/permission'
import Avatar from '@/components/Avatar.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)

/** 最近项目（当前用户可见的前 3 个） */
const recentProjects = computed(() =>
  appStore.projects
    .filter((p) => canViewProject(currentUser.value, p, userStore.users))
    .slice(0, 3)
)

const navItems = [
  { path: '/', label: '工作台', icon: 'home' },
  { path: '/projects', label: '项目空间', icon: 'folder' },
  { path: '/tasks', label: '我的任务', icon: 'task' },
  { path: '/agents', label: '智能体中心', icon: 'agent' },
  { path: '/skills', label: 'Skill 能力', icon: 'skill' }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const switchUser = (id: string) => {
  if (id === '__reset') return
  userStore.switchUser(id)
  const u = userStore.getUser(id)
  if (u) ElMessage.success(`已切换身份：${u.name} · ${u.title}`)
}

const resetDemo = async () => {
  try {
    await ElMessageBox.confirm('将清除本地修改并恢复默认演示数据，确定继续？', '重置演示数据', {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning'
    })
    appStore.resetData()
    ElMessage.success('演示数据已重置')
  } catch {
    /* 取消 */
  }
}
</script>

<template>
  <div class="app-layout">
    <!-- 左侧 Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-mark">D</span>
        DevMatrix
      </div>

      <div class="sidebar-section">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="router.push(item.path)"
        >
          <span class="nav-icon">
            <svg v-if="item.icon === 'home'" viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M8 1.5 1.5 7v7.5h4.5V10h4v4.5h4.5V7L8 1.5z"/></svg>
            <svg v-else-if="item.icon === 'folder'" viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M1.5 3.5A1 1 0 0 1 2.5 2.5h3.6l1.4 1.5h6a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-9z"/></svg>
            <svg v-else-if="item.icon === 'task'" viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M2.5 2.5h11v2h-11v-2zm0 4.5h11v2h-11v-2zm0 4.5h7v2h-7v-2z"/></svg>
            <svg v-else-if="item.icon === 'agent'" viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M8 1.5a1 1 0 0 1 1 1v1h2.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2H7v-1a1 1 0 0 1 1-1zM5.5 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
            <svg v-else viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M8 1.5 14 5v6l-6 3.5L2 11V5l6-3.5zm0 2.1L4.2 5.8 8 7.9l3.8-2.1L8 3.6z"/></svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </div>

      <div class="sidebar-divider"></div>

      <div class="sidebar-section">
        <div class="sidebar-section-title">最近项目</div>
        <div
          v-for="p in recentProjects"
          :key="p.id"
          class="nav-item"
          :class="{ active: route.path === `/projects/${p.id}` }"
          @click="router.push(`/projects/${p.id}`)"
        >
          <span class="nav-label">{{ p.name }}</span>
          <span class="nav-key">{{ p.key }}</span>
        </div>
      </div>

      <div class="sidebar-divider"></div>

      <div class="sidebar-section">
        <div
          class="nav-item"
          :class="{ active: route.path.startsWith('/system') }"
          @click="router.push('/system')"
        >
          <span class="nav-icon">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M8 5.5A2.5 2.5 0 1 0 8 10.5 2.5 2.5 0 0 0 8 5.5zm6.4 4.1-1.5-.3a5.6 5.6 0 0 1-.5 1.2l.9 1.3-1.4 1.4-1.3-.9c-.4.2-.8.4-1.2.5l-.3 1.5h-2l-.3-1.5c-.4-.1-.8-.3-1.2-.5l-1.3.9-1.4-1.4.9-1.3c-.2-.4-.4-.8-.5-1.2l-1.5-.3v-2l1.5-.3c.1-.4.3-.8.5-1.2l-.9-1.3 1.4-1.4 1.3.9c.4-.2.8-.4 1.2-.5l.3-1.5h2l.3 1.5c.4.1.8.3 1.2.5l1.3-.9 1.4 1.4-.9 1.3c.2.4.4.8.5 1.2l1.5.3v2z"/></svg>
          </span>
          <span class="nav-label">系统管理</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <Avatar :name="currentUser.name" :color="currentUser.color" :size="26" />
        <span class="sf-name">{{ currentUser.name }} · {{ currentUser.title }}</span>
      </div>
    </aside>

    <!-- 右侧主区域 -->
    <div class="app-main">
      <header class="app-header">
        <span class="page-title">{{ route.meta.title }}</span>
        <div class="header-spacer"></div>

        <!-- 身份切换 -->
        <el-dropdown trigger="click" @command="switchUser">
          <div class="identity-switch">
            <Avatar :name="currentUser.name" :color="currentUser.color" :size="26" />
            <div class="id-text">
              <div class="id-name">{{ currentUser.name }}</div>
              <div class="id-title">{{ currentUser.title }}</div>
            </div>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="#9ca3af"><path d="M4.5 6 8 9.5 11.5 6 10.5 5 8 7.5 5.5 5z"/></svg>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="dd-tip">切换演示身份</div>
              <el-dropdown-item
                v-for="u in userStore.users"
                :key="u.id"
                :command="u.id"
                :class="{ 'dd-active': u.id === currentUser.id }"
              >
                <div class="dd-item">
                  <Avatar :name="u.name" :color="u.color" :size="24" />
                  <div>
                    <div class="dd-name">{{ u.name }}</div>
                    <div class="dd-sub">{{ u.title }}</div>
                  </div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="__reset" class="dd-reset" @click.stop="resetDemo">
                重置演示数据
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.identity-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  outline: none;
}

.identity-switch:hover {
  border-color: #c9c6f5;
  background: #fafbfc;
}

.id-text {
  line-height: 1.25;
}

.id-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-1);
}

.id-title {
  font-size: 11px;
  color: var(--text-2);
}

.dd-tip {
  padding: 6px 12px 4px;
  font-size: 11px;
  color: var(--text-3);
}

.dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dd-name {
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.3;
}

.dd-sub {
  font-size: 11px;
  color: var(--text-2);
}

.dd-active .dd-name {
  color: var(--primary);
  font-weight: 600;
}

.dd-reset {
  color: #dc2626 !important;
  font-size: 12px;
}
</style>
