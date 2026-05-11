export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  recipient: 'all' | 'students' | 'teachers' | 'admins'
  sender: string
  senderAvatar: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: "Yangi kurs qo'shildi",
    message:
      "React va TypeScript kursi muvaffaqiyatli qo'shildi. Barcha o'qituvchilar va talabalar uchun ochiq.",
    type: 'success',
    priority: 'high',
    recipient: 'all',
    sender: 'Admin',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-24T10:30:00'),
    read: false,
    actionUrl: '/courses',
    actionText: "Kursni ko'rish",
  },
  {
    id: '2',
    title: 'Tizim yangilanishi',
    message:
      "LinguaPro tizimi yangilangan. Yangi funksiyalar qo'shildi: E'lonlar, Bildirishlar va yaxshilangan chat.",
    type: 'info',
    priority: 'medium',
    recipient: 'all',
    sender: 'System',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-24T09:15:00'),
    read: true,
    actionUrl: undefined,
    actionText: undefined,
  },
  {
    id: '3',
    title: 'Uchrashuv eslatmasi',
    message:
      "Bugun soat 15:00 da o'qituvchilar uchun uchrashuv bo'lib o'tadi. Iltimos, qatnashishingizni so'raymiz.",
    type: 'warning',
    priority: 'medium',
    recipient: 'teachers',
    sender: 'Director',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-24T08:00:00'),
    read: false,
    actionUrl: '/meetings',
    actionText: "Uchrashuvga o'tish",
  },
  {
    id: '4',
    title: 'Xatolik hisoboti',
    message:
      "Chat tizimida vaqtinchalik xatolik yuz berdi. Muammo hal qilindi. Uzr so'raymiz.",
    type: 'error',
    priority: 'high',
    recipient: 'all',
    sender: 'System',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-23T18:45:00'),
    read: true,
    actionUrl: undefined,
    actionText: undefined,
  },
  {
    id: '5',
    title: "Yangi o'quvchi qo'shildi",
    message:
      "JavaScript guruhiga 3 ta yangi o'quvchi qo'shildi. Guruh jami 15 nafarga yetdi.",
    type: 'info',
    priority: 'low',
    recipient: 'teachers',
    sender: 'System',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-23T16:20:00'),
    read: true,
    actionUrl: undefined,
    actionText: undefined,
  },
  {
    id: '6',
    title: 'Topshiriq muddati yaqinlashmoqda',
    message:
      "React final loyihasi topshirish muddati 3 kun ichida tugaydi. Talabalarga eslatma berishingizni so'raymiz.",
    type: 'warning',
    priority: 'medium',
    recipient: 'teachers',
    sender: 'System',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-23T14:10:00'),
    read: false,
    actionUrl: '/assignments',
    actionText: "Topshiriqlarni ko'rish",
  },
  {
    id: '7',
    title: 'Muvaffaqiyatli yakunlandi',
    message:
      'Python kursi muvaffaqiyatli yakunlandi. Barcha talabalar sertifikat oldi.',
    type: 'success',
    priority: 'low',
    recipient: 'all',
    sender: 'Admin',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-22T17:30:00'),
    read: true,
    actionUrl: undefined,
    actionText: undefined,
  },
  {
    id: '8',
    title: "Tizim to'xtashi",
    message:
      "Tizim texnik xizmat uchun 2 soatga to'xtatiladi: 2024-04-25 02:00 - 04:00",
    type: 'error',
    priority: 'high',
    recipient: 'all',
    sender: 'System',
    senderAvatar: '/src/assets/favicon.png',
    timestamp: new Date('2024-04-22T12:00:00'),
    read: true,
    actionUrl: undefined,
    actionText: undefined,
  },
]

export const notificationStats = {
  total: mockNotifications.length,
  unread: mockNotifications.filter((n) => !n.read).length,
  byType: {
    info: mockNotifications.filter((n) => n.type === 'info').length,
    success: mockNotifications.filter((n) => n.type === 'success').length,
    warning: mockNotifications.filter((n) => n.type === 'warning').length,
    error: mockNotifications.filter((n) => n.type === 'error').length,
  },
  byPriority: {
    low: mockNotifications.filter((n) => n.priority === 'low').length,
    medium: mockNotifications.filter((n) => n.priority === 'medium').length,
    high: mockNotifications.filter((n) => n.priority === 'high').length,
  },
}
