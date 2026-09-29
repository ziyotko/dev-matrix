<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { canViewProject, getProjectRelation } from '@/utils/permission'
import ProjectRow from '@/components/ProjectRow.vue'
import type { Project, ProjectRelation } from '@/types'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)
const keyword = ref('')

/** 当前用户可见项目（上级看下级 / 同团队互看 / 自己创建与参与） */
const visibleProjects = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return appStore.projects
    .filter((p) => canViewProject(currentUser.value, p, userStore.users))
    .filter(
      (p) =>
        !kw ||
        p.name.toLowerCase().includes(kw) ||
        p.key.toLowerCase().includes(kw)
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})

const relationOf = (p: Project): ProjectRelation =>
  getProjectRelation(currentUser.value, p, userStore.users) ?? 'team'

const openProject = (p: Project) => router.push(`/projects/${p.id}`)

/* ---------- 新建项目 ---------- */
const createVisible = ref(false)
const createForm = ref({
  name: '',
  key: '',
  description: '',
  ownerId: '',
  deptId: 'product-rd'
})

const openCreate = () => {
  createForm.value = {
    name: '',
    key: '',
    description: '',
    ownerId: currentUser.value.id,
    deptId: currentUser.value.deptId
  }
  createVisible.value = true
}

const submitCreate = () => {
  if (!createForm.value.name.trim()) {
    ElMessage.warning('请填写项目名称')
    return
  }
  if (!createForm.value.key.trim()) {
    ElMessage.warning('请填写项目标识')
    return
  }
  const p = appStore.addProject({
    name: createForm.value.name.trim(),
    key: createForm.value.key.trim().toUpperCase(),
    description: createForm.value.description,
    ownerId: createForm.value.ownerId,
    deptId: createForm.value.deptId,
    memberIds: [createForm.value.ownerId]
  })
  ElMessage.success(`项目「${p.name}」已创建`)
  createVisible.value = false
  router.push(`/projects/${p.id}`)
}
</script>

<template>
  <div>
    <div class="page-head">
      <div class="ph-main">
        <h1>项目空间</h1>
        <div class="ph-sub">查看你有权限访问的研发项目</div>
      </div>
      <div class="ph-actions">
        <el-input
          v-model="keyword"
          placeholder="搜索项目"
          clearable
          style="width: 200px"
        >
          <template #prefix>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="#9ca3af"><path d="M11.7 10.3a6 6 0 1 1-1.4-1.4l3 3-1.4 1.4-3-3zm-3-7A5 5 0 1 0 13.7 10.3 5 5 0 0 0 8.7 3.3z"/></svg>
          </template>
        </el-input>
        <el-button type="primary" @click="openCreate">
          <span style="margin-right: 4px">+</span>新建项目
        </el-button>
      </div>
    </div>

    <div class="project-list">
      <div class="project-row project-head-row">
        <span>项目</span>
        <span>负责人</span>
        <span>我的关系</span>
        <span>进度</span>
        <span style="text-align: center">任务</span>
        <span>状态</span>
        <span style="text-align: right">更新时间</span>
      </div>
      <template v-if="visibleProjects.length">
        <ProjectRow
          v-for="p in visibleProjects"
          :key="p.id"
          :project="p"
          :relation="relationOf(p)"
          @open="openProject"
        />
      </template>
      <div v-else class="empty-state">
        <div class="es-icon">📁</div>
        没有可访问的项目
      </div>
    </div>

    <!-- 新建项目 Dialog -->
    <el-dialog v-model="createVisible" title="新建项目" width="460px" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="项目名称" required>
          <el-input v-model="createForm.name" placeholder="例如：智能客服系统" maxlength="30" />
        </el-form-item>
        <el-form-item label="项目标识" required>
          <el-input v-model="createForm.key" placeholder="例如：AI-CS（用于任务编号前缀）" maxlength="10" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="简要描述项目目标" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="createForm.ownerId" style="width: 100%">
            <el-option
              v-for="u in userStore.users"
              :key="u.id"
              :label="`${u.name} · ${u.title}`"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属团队">
          <el-select v-model="createForm.deptId" style="width: 100%">
            <el-option
              v-for="d in userStore.depts.filter((x) => x.parentId)"
              :key="d.id"
              :label="d.name"
              :value="d.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建项目</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.project-head-row {
  cursor: default;
  font-size: 11px;
  color: var(--text-3);
  background: #fafbfc;
  padding: 7px 14px;
}

.project-head-row:hover {
  background: #fafbfc;
}
</style>
