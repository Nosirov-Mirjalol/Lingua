import { hasAccessCode } from './access'
import { useUserInfo, useUserToken } from '@/stores/userStore'

/**
 * permission/role check hook
 * @param baseOn - check type: 'role' or 'permission'
 *
 * @example
 * const { check, checkAny, checkAll } = useAuthCheck('permission');
 * check('user.create')
 * checkAny(['user.create', 'user.edit'])
 * checkAll(['user.create', 'user.edit'])
 */
export const useAuthCheck = (
  baseOn: 'role' | 'permission' = 'permission'
) => {
  const { accessToken } = useUserToken()
  const { permissions = [], roles = [] } = useUserInfo()

  const resourcePool = baseOn === 'role' ? roles : permissions

  const check = (item: string): boolean => {
    if (!accessToken) {
      return false
    }

    return hasAccessCode(resourcePool, item)
  }

  const checkAny = (items: string[]) => {
    if (items.length === 0) {
      return true
    }

    return items.some(check)
  }

  const checkAll = (items: string[]) => {
    if (items.length === 0) {
      return true
    }

    return items.every(check)
  }

  return { check, checkAny, checkAll }
}
