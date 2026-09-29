import { defineStore } from 'pinia'
import { mockDepts, mockUsers } from '@/mock/data'
import type { Dept, User } from '@/types'

/** 当前用户 store（身份切换） */
export const useUserStore = defineStore('user', {
  state: () => ({
    users: mockUsers as User[],
    depts: mockDepts as Dept[],
    currentUserId: 'u-zhangsan'
  }),
  getters: {
    currentUser(state): User {
      return state.users.find((u) => u.id === state.currentUserId) ?? state.users[0]
    },
    deptName(state): (id: string) => string {
      return (id: string) => state.depts.find((d) => d.id === id)?.name ?? ''
    }
  },
  actions: {
    switchUser(id: string) {
      if (this.users.some((u) => u.id === id)) {
        this.currentUserId = id
      }
    },
    getUser(id: string): User | undefined {
      return this.users.find((u) => u.id === id)
    }
  }
})
