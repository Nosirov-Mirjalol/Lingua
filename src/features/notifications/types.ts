export type BroadcastTargetRole = 'teacher' | 'student' | 'all'

export type Notification = {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
  target_role?: BroadcastTargetRole
  type?: string
}
