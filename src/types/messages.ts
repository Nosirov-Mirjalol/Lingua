export interface MessageSender {
  id: number
  username: string
  full_name: string
  role: 'admin' | 'teacher' | 'student'
}

export interface LastMessage {
  content: string
  type: string
  sender: string
  created_at: string
}

export interface MessageGroup {
  id: number
  name: string
  status: string
  unread_count: number
  last_message: LastMessage | null
}

export interface Message {
  id: number
  group: number
  sender: MessageSender
  content: string
  message_type: 'text' | 'file' | 'image'
  file_url: string | null
  image_url: string | null
  is_read: string
  read_count: string
  created_at: string
}

export interface MessagesResponse {
  count: number
  page: number
  page_size: number
  results: Message[]
}
