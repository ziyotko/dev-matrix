<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Skill } from '@/types'

const appStore = useAppStore()

const domainTabs = [
  { key: 'all', label: '全部' },
  { key: 'requirement', label: '需求' },
  { key: 'development', label: '开发' },
  { key: 'quality', label: '质量' },
  { key: 'test', label: '测试' },
  { key: 'deployment', label: '部署' },
  { key: 'operation', label: '运维' },
  { key: 'cross', label: '跨领域' }
]

const activeDomain = ref('all')

const visibleSkills = computed(() => {
  const list =
    activeDomain.value === 'all'
      ? appStore.skills
      : appStore.skills.filter((s) => s.domain === activeDomain.value)
  return [...list].sort((a, b) => b.usageCount - a.usageCount)
})

const detail = ref<Skill | null>(null)

const detailVisible = computed({
  get: () => detail.value !== null,
  set: (v: boolean) => {
    if (!v) detail.value = null
  }
})

const domainLabel: Record<string, string> = {
  requirement: '需求',
  development: '开发',
  quality: '质量',
  test: '测试',
  deployment: '部署',
  operation: '运维',
  cross: '跨领域'
}

const capLabel: Record<string, string> = {
  generate: '生成',
  analyze: '分析',
  review: '审查',
  convert: '转换',
  execute: '执行'
}
</script>

<template>
  <div>
    <div class="page-head">
      <div class="ph-main">
        <h1>Skill 能力</h1>
        <div class="ph-sub">智能体可调用的原子能力，按领域组织</div>
      </div>
    </div>

    <div class="filter-tabs">
      <div
        v-for="t in domainTabs"
        :key="t.key"
        class="filter-tab"
        :class="{ active: activeDomain === t.key }"
        @click="activeDomain = t.key"
      >
        {{ t.label }}
        <span class="ft-count">
          {{ t.key === 'all' ? appStore.skills.length : appStore.skills.filter((s) => s.domain === t.key).length }}
        </span>
      </div>
    </div>

    <div class="panel">
      <div class="panel-body flush">
        <div
          v-for="s in visibleSkills"
          :key="s.id"
          class="skill-row"
          @click="detail = s"
        >
          <span class="sr-name">
            {{ s.name }}
            <span v-if="s.status === 'planned'" class="sr-planned">规划中</span>
          </span>
          <span class="sr-domain">{{ domainLabel[s.domain] }}</span>
          <span class="sr-cap">{{ capLabel[s.capabilityType] }}</span>
          <span class="sr-desc">{{ s.description }}</span>
          <span class="sr-version">v{{ s.version }}</span>
          <span class="sr-usage">{{ s.usageCount }} 次</span>
        </div>
        <div v-if="!visibleSkills.length" class="empty-state">该领域暂无 Skill</div>
      </div>
    </div>

    <!-- Skill 详情 Drawer -->
    <el-drawer v-model="detailVisible" title="Skill 详情" size="480px">
      <template v-if="detail">
        <div class="sd-head">
          <span class="sd-name">
            {{ detail.name }}
            <span v-if="detail.status === 'planned'" class="sr-planned">规划中</span>
          </span>
          <span class="sd-sub">
            {{ domainLabel[detail.domain] }} · {{ capLabel[detail.capabilityType] }} · v{{ detail.version }}
          </span>
        </div>

        <div class="sd-section">
          <div class="sd-title">能力说明</div>
          <div class="sd-text">{{ detail.description }}</div>
        </div>

        <div class="sd-section">
          <div class="sd-title">适用场景</div>
          <div class="sd-text">{{ detail.scene }}</div>
        </div>

        <div class="sd-section">
          <div class="sd-title">输入</div>
          <div class="sd-tags">
            <span v-for="i in detail.inputs" :key="i" class="sd-tag">{{ i }}</span>
            <span v-if="!detail.inputs.length" class="sd-text">无</span>
          </div>
        </div>

        <div class="sd-section">
          <div class="sd-title">输出</div>
          <div class="sd-tags">
            <span v-for="o in detail.outputs" :key="o" class="sd-tag out">{{ o }}</span>
            <span v-if="!detail.outputs.length" class="sd-text">无</span>
          </div>
        </div>

        <div class="sd-section">
          <div class="sd-title">使用情况</div>
          <div class="sd-text">累计调用 {{ detail.usageCount }} 次</div>
        </div>
      </template>
    </el-drawer>
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

.sr-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sr-planned {
  font-size: 10px;
  color: #d97706;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 400;
}

.sr-domain {
  font-size: 12px;
  color: var(--text-2);
}

.sr-cap {
  font-size: 11px;
  color: var(--text-2);
  background: #f3f4f6;
  padding: 1px 7px;
  border-radius: 4px;
}

.sr-desc {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sr-version {
  font-size: 11px;
  color: var(--text-3);
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.sr-usage {
  font-size: 12px;
  color: var(--text-2);
  text-align: right;
}

.sd-head {
  margin-bottom: 16px;
}

.sd-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sd-sub {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 4px;
}

.sd-section {
  margin-bottom: 16px;
}

.sd-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 6px;
}

.sd-text {
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.6;
}

.sd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sd-tag {
  font-size: 12px;
  color: var(--text-1);
  background: #f3f4f6;
  padding: 3px 9px;
  border-radius: 4px;
}

.sd-tag.out {
  background: #eef2ff;
  color: var(--primary);
}
</style>
