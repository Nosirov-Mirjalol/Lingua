export interface Group {
  id: number
  name: string
  description: string
  students: number
  schedule: string
  status: 'active' | 'inactive'
  teacher: string
  room: string
  createdAt?: string
  updatedAt?: string
}

export interface Student {
  id: number
  name: string
  phone: string
  attendance: 'present' | 'late' | 'absent'
  activity: number
}

export const groupsData: Group[] = [
  {
    id: 1,
    name: 'IELTS 7.5 Morning',
    description: 'Advanced IELTS preparation for speaking and writing',
    students: 12,
    schedule: 'Dushanba-Chorshanba 09:00-11:00',
    status: 'active',
    teacher: 'John Doe',
    room: '201',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Mobile Development Group',
    description: 'React Native and Flutter mobile development',
    students: 15,
    schedule: 'Dushanba-Juma 10:00-12:00',
    status: 'active',
    teacher: 'Jane Smith',
    room: '102',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'Data Science Group',
    description: 'Python and machine learning fundamentals',
    students: 10,
    schedule: 'Seshanba-Juma 16:00-18:00',
    status: 'active',
    teacher: 'Mike Johnson',
    room: '103',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: 4,
    name: 'UI/UX Design Group',
    description: 'User interface and experience design principles',
    students: 8,
    schedule: 'Seshanba-Payshanba 14:00-16:00',
    status: 'active',
    teacher: 'Sarah Wilson',
    room: '205',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
  },
  {
    id: 5,
    name: 'DevOps Group',
    description: 'Cloud infrastructure and CI/CD pipelines',
    students: 6,
    schedule: 'Chorshanba-Juma 16:00-18:00',
    status: 'active',
    teacher: 'David Brown',
    room: '301',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: 6,
    name: 'Backend Development Group',
    description: 'Server-side development and database management',
    students: 9,
    schedule: 'Shanba-Yakshanba 10:00-13:00',
    status: 'active',
    teacher: 'Emily Davis',
    room: '302',
    createdAt: '2024-02-20',
    updatedAt: '2024-02-20',
  },
]

// Teacher-specific groups data
export const teacherGroupsData = {
  1: [
    {
      id: 1,
      name: 'IELTS Advanced',
      teacher: 'John Doe',
      schedule: 'Dushanba-Chorshanba 09:00-11:00',
      students: 15,
      room: '201',
      description: 'Advanced IELTS preparation course',
    },
    {
      id: 2,
      name: 'Business English',
      teacher: 'John Doe',
      schedule: 'Seshanba-Payshanba 14:00-16:00',
      students: 8,
      room: '305',
      description: 'Professional business communication',
    },
  ],
  2: [
    {
      id: 3,
      name: 'General English A2',
      teacher: 'Jane Smith',
      schedule: 'Dushanba-Chorshanba-Juma 10:00-12:00',
      students: 20,
      room: '102',
      description: 'Elementary level English course',
    },
    {
      id: 4,
      name: 'Conversation Club',
      teacher: 'Jane Smith',
      schedule: 'Payshanba 16:00-18:00',
      students: 12,
      room: '203',
      description: 'Speaking practice and fluency development',
    },
  ],
  3: [
    {
      id: 5,
      name: 'TOEFL Preparation',
      teacher: 'Mike Johnson',
      schedule: 'Seshanba-Chorshanba 17:00-19:00',
      students: 10,
      room: '401',
      description: 'TOEFL exam preparation course',
    },
    {
      id: 6,
      name: 'Academic Writing',
      teacher: 'Mike Johnson',
      schedule: 'Juma 13:00-15:00',
      students: 6,
      room: '205',
      description: 'Academic writing skills development',
    },
  ],
}

// Mock students data for each group
export const mockStudentsData: Record<number, Student[]> = {
  1: [
    {
      id: 1,
      name: 'Ali Karimov',
      phone: '+998 90 123 45 67',
      attendance: 'present',
      activity: 95,
    },
    {
      id: 2,
      name: 'Dilnoza Saidova',
      phone: '+998 91 234 56 78',
      attendance: 'late',
      activity: 88,
    },
    {
      id: 3,
      name: 'Bekzod Toshmatov',
      phone: '+998 93 345 67 89',
      attendance: 'present',
      activity: 92,
    },
    {
      id: 4,
      name: 'Malika Xolmatova',
      phone: '+998 94 456 78 90',
      attendance: 'absent',
      activity: 78,
    },
    {
      id: 5,
      name: 'Javlon Umarov',
      phone: '+998 95 567 89 01',
      attendance: 'present',
      activity: 96,
    },
  ],
  2: [
    {
      id: 6,
      name: 'Sardor Rahimov',
      phone: '+998 90 111 22 33',
      attendance: 'present',
      activity: 91,
    },
    {
      id: 7,
      name: 'Nodira Bekova',
      phone: '+998 91 222 33 44',
      attendance: 'present',
      activity: 89,
    },
    {
      id: 8,
      name: 'Aziz Nazarov',
      phone: '+998 93 333 44 55',
      attendance: 'late',
      activity: 85,
    },
  ],
  3: [
    {
      id: 9,
      name: 'Gulnara Karimova',
      phone: '+998 90 444 55 66',
      attendance: 'present',
      activity: 94,
    },
    {
      id: 10,
      name: 'Rustam Alimov',
      phone: '+998 91 555 66 77',
      attendance: 'present',
      activity: 90,
    },
    {
      id: 11,
      name: 'Zarina Tosheva',
      phone: '+998 93 666 77 88',
      attendance: 'late',
      activity: 87,
    },
    {
      id: 12,
      name: 'Bobur Akbarov',
      phone: '+998 94 777 88 99',
      attendance: 'present',
      activity: 93,
    },
  ],
  4: [
    {
      id: 13,
      name: 'Kamola Umarova',
      phone: '+998 90 888 99 00',
      attendance: 'present',
      activity: 96,
    },
    {
      id: 14,
      name: 'Farrux Saidov',
      phone: '+998 91 999 00 11',
      attendance: 'absent',
      activity: 82,
    },
    {
      id: 15,
      name: 'Laylo Hamroqulova',
      phone: '+998 93 000 11 22',
      attendance: 'present',
      activity: 91,
    },
  ],
  5: [
    {
      id: 16,
      name: 'Bahodir Ruziev',
      phone: '+998 90 111 22 33',
      attendance: 'present',
      activity: 88,
    },
    {
      id: 17,
      name: 'Munira Azizova',
      phone: '+998 91 222 33 44',
      attendance: 'late',
      activity: 86,
    },
    {
      id: 18,
      name: 'Jahongir Otajonov',
      phone: '+998 93 333 44 55',
      attendance: 'present',
      activity: 92,
    },
  ],
  6: [
    {
      id: 19,
      name: 'Dildora Alikulova',
      phone: '+998 90 444 55 66',
      attendance: 'present',
      activity: 95,
    },
    {
      id: 20,
      name: 'Shukurullo Tursunov',
      phone: '+998 91 555 66 77',
      attendance: 'present',
      activity: 89,
    },
  ],
}
