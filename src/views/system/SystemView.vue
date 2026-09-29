<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const appStore = useAppStore()
const userStore = useUserStore()

const stats = computed(() => ({
  projects: appStore.projects.length,
  tasks: appStore.tasks.length,
  agents: appStore.agents.length,
  skills: appStore.skills.length,
  executions: appStore.executions.length,
  deliverables: appStore.deliverables.length,
  users: userStore.users.length
}))
</script>

<template>
  <div>
    <div class="page-head">
      <div class="ph-main">
        <h1>系统管理</h1>
        <div class="ph-sub">演示环境概览（只读展示）</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat-card">
        <div class="sc-num">{{ stats.projects }}</div>
        <div class="sc-label">项目</div>
      </div>
      <div class="stat-card">
        <div class="sc-num">{{ stats.tasks }}</div>
        <div class="sc-label">任务</div>
      </div>
      <div class="stat-card">
        <div class="sc-num">{{ stats.agents }}</div>
        <div class="sc-label">智能体</div>
      </div>
      <div class="stat-card">
        <div class="sc-num">{{ stats.skills }}</div>
        <div class="sc-label">Skill</div>
      </div>
      <div class="stat-card">
        <div class="sc-num">{{ stats.executions }}</div>
        <div class="sc-label">执行记录</div>
      </div>
      <div class="stat-card">
        <div class="sc-num">{{ stats.users }}</div>
        <div class="sc-label">成员</div>
      </div>
    </div>

    <div class="panel section-gap">
      <div class="panel-head">
        <span class="ph-title">环境信息</span>
      </div>
      <div class="panel-body flush">
        <div class="sys-item"><span class="si-label">平台版本</span><span class="si-value">DevMatrix Demo v1.0</span></div>
        <div class="sys-item"><span class="si-label">数据模式</span><span class="si-value">Mock 数据 + localStorage 持久化</span></div>
        <div class="sys-item"><span class="si-label">后端服务</span><span class="si-value">无（纯前端演示）</span></div>
        <div class="sys-item"><span class="si-label">身份切换</span><span class="si-value">右上角切换演示身份</span></div>
        <div class="sys-item"><span class="si-label">数据重置</span><span class="si-value">右上角身份菜单 → 重置演示数据</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sys-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 14px;
  border-bottom: 1px solid var(--border-light);
  font-size: 13px;
}

.sys-item:last-child {
  border-bottom: none;
}

.si-label {
  color: var(--text-2);
}

.si-value {
  color: var(--text-1);
  font-weight: 500;
}
</style>
