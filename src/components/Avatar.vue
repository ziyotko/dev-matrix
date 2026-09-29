<script setup lang="ts">
import { computed } from 'vue'
import { nameInitial } from '@/utils'

const props = withDefaults(
  defineProps<{
    name: string
    color?: string
    size?: number
    /** 智能体图标（机器人） */
    agent?: boolean
  }>(),
  { size: 24, agent: false }
)

const initial = computed(() => nameInitial(props.name))
const bg = computed(() => props.color ?? '#6b7280')
</script>

<template>
  <span
    class="avatar"
    :style="{ width: size + 'px', height: size + 'px', background: bg, fontSize: Math.round(size * 0.42) + 'px' }"
    :title="name"
  >
    <span v-if="agent" class="agent-glyph">AI</span>
    <span v-else>{{ initial }}</span>
  </span>
</template>

<style scoped>
.agent-glyph {
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
