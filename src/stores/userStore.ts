import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AccessEntry } from '@/features/auth/access'

export type UserInfo = {
  permissions?: AccessEntry[]
  roles?: AccessEntry[]
} & Record<string, unknown>

export type UserToken = {
  accessToken?: string
  refreshToken?: string
} & Record<string, unknown>

type UserStore = {
  userInfo: Partial<UserInfo>
  userToken: UserToken
  tokenTimestamp: number | null
  actions: {
    setUserInfo: (userInfo: UserInfo) => void
    setUserToken: (token: UserToken) => void
    clearUserInfoAndToken: () => void
  }
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userInfo: {},
      userToken: {},
      tokenTimestamp: null,
      actions: {
        setUserInfo: (userInfo) => set({ userInfo }),
        setUserToken: (userToken) =>
          set({
            userToken,
            tokenTimestamp: Date.now(),
          }),
        clearUserInfoAndToken: () =>
          set({
            userInfo: {},
            userToken: {},
            tokenTimestamp: null,
          }),
      },
    }),
    {
      name: 'userStore',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userInfo: state.userInfo,
        userToken: state.userToken,
        tokenTimestamp: state.tokenTimestamp,
      }),
    }
  )
)

export const useUserInfo = () => useUserStore((state) => state.userInfo)
export const useUserToken = () => useUserStore((state) => state.userToken)
export const useUserPermissions = () =>
  useUserStore((state) => state.userInfo.permissions ?? [])
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles ?? [])
export const useUserActions = () => useUserStore((state) => state.actions)

export default useUserStore
