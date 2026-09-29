import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'workbench',
          component: () => import('@/views/workbench/WorkbenchView.vue'),
          meta: { title: '工作台' }
        },
        {
          path: 'projects',
          name: 'projects',
          component: () => import('@/views/projects/ProjectListView.vue'),
          meta: { title: '项目空间' }
        },
        {
          path: 'projects/:id',
          name: 'project-detail',
          component: () => import('@/views/projects/ProjectDetailView.vue'),
          meta: { title: '项目详情' }
        },
        {
          path: 'tasks',
          name: 'my-tasks',
          component: () => import('@/views/tasks/MyTasksView.vue'),
          meta: { title: '我的任务' }
        },
        {
          path: 'tasks/:id',
          name: 'task-detail',
          component: () => import('@/views/tasks/TaskDetailView.vue'),
          meta: { title: '任务详情' }
        },
        {
          path: 'agents',
          name: 'agents',
          component: () => import('@/views/agents/AgentsView.vue'),
          meta: { title: '智能体中心' }
        },
        {
          path: 'skills',
          name: 'skills',
          component: () => import('@/views/skills/SkillsView.vue'),
          meta: { title: 'Skill 能力' }
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('@/views/system/SystemView.vue'),
          meta: { title: '系统管理' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · DevMatrix` : 'DevMatrix 研发智能协同平台'
})

export default router
