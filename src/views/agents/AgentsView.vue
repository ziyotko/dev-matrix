<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import StatusDot from '@/components/StatusDot.vue'

const appStore = useAppStore()

const agents = computed(() => appStore.agents)

const domainLabel: Record<string, string> = {
  requirement: '需求',
  development: '开发',
  quality: '质量',
  test: '测试',
  deployment: '部署',
  operation: '运维',
  dispatch: '调度'
}
</script>

<template>
  <div>
    <div class="page-head">
      <div class="ph-main">
        <h1>智能体中心</h1>
        <div class="ph-sub">参与研发工作的 AI 智能体，可被指派执行任务</div>
      </div>
    </div>

    <div class="agent-grid">
      <div v-for="a in agents" :key="a.id" class="agent-card-lg">
        <div class="acl-head">
          <span class="acl-avatar" :style="{ background: a.color }">AI</span>
          <div style="flex: 1; min-width: 0">
            <div class="acl-name">{{ a.cnName }}</div>
            <div class="acl-sub">{{ a.name }} · {{ domainLabel[a.domain] }}</div>
          </div>
          <StatusDot :agent-status="a.status" />
        </div>

        <div class="acl-desc">{{ a.description }}</div>

        <div class="acl-caps">
          <div v-for="cap in a.capabilities" :key="cap" class="acl-cap">
            <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M6.5 10.5 3.5 7.5 4.9 6.1l1.6 1.6 4-4L11.9 5z"/></svg>
            {{ cap }}
          </div>
        </div>

        <div class="acl-stats">
          <div class="acs-item">
            <div class="acs-num">{{ a.todayRuns }}</div>
            <div class="acs-label">今日执行</div>
          </div>
          <div class="acs-item">
            <div class="acs-num">{{ a.successRate }}%</div>
            <div class="acs-label">成功率</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acl-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.acl-avatar {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.acl-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}

.acl-sub {
  font-size: 11px;
  color: var(--text-2);
}

.acl-desc {
  font-size: 12px;
  color: var(--text-2);
  line-height: 1.5;
  margin: 10px 0;
  min-height: 36px;
}

.acl-caps {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
}

.acl-cap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-1);
}

.acl-cap svg {
  color: #16a34a;
  flex-shrink: 0;
}

.acl-stats {
  display: flex;
  gap: 24px;
  border-top: 1px solid var(--border-light);
  padding-top: 10px;
}

.acs-num {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
}

.acs-label {
  font-size: 11px;
  color: var(--text-3);
}
</style>
