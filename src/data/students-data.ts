export interface Student {
  id: number
  name: string
  email: string
  phone: string
  group: number
  groupName: string
  avatar?: string
  status: 'active' | 'inactive' | 'graduated'
  enrollmentDate?: string
  progress?: number
  attendance?: number
}

export const studentsData: Student[] = [
  {
    id: 1,
    name: "Ali Karimov",
    email: "ali.karimov@student.com",
    phone: "+998 90 123 45 67",
    group: 1,
    groupName: "Web Development 101",
    avatar: "/avatars/student1.jpg",
    status: "active",
    enrollmentDate: "2024-01-15",
    progress: 75,
    attendance: 85
  },
  {
    id: 2,
    name: "Dilnoza Abdullayeva",
    email: "dilnoza.abdullayeva@student.com",
    phone: "+998 90 234 56 78",
    group: 1,
    groupName: "Web Development 101",
    avatar: "/avatars/student2.jpg",
    status: "active",
    enrollmentDate: "2024-01-15",
    progress: 82,
    attendance: 90
  },
  {
    id: 3,
    name: "Bekzod Tursunov",
    email: "bekzod.tursunov@student.com",
    phone: "+998 90 345 67 89",
    group: 2,
    groupName: "Mobile App Development",
    avatar: "/avatars/student3.jpg",
    status: "active",
    enrollmentDate: "2024-01-20",
    progress: 68,
    attendance: 78
  },
  {
    id: 4,
    name: "Malika Xolmatova",
    email: "malika.xolmatova@student.com",
    phone: "+998 90 456 78 90",
    group: 2,
    groupName: "Mobile App Development",
    avatar: "/avatars/student4.jpg",
    status: "active",
    enrollmentDate: "2024-01-20",
    progress: 91,
    attendance: 95
  },
  {
    id: 5,
    name: "Javlon Botirov",
    email: "javlon.botirov@student.com",
    phone: "+998 90 567 89 01",
    group: 3,
    groupName: "Data Science Basics",
    avatar: "/avatars/student5.jpg",
    status: "inactive",
    enrollmentDate: "2024-02-01",
    progress: 45,
    attendance: 60
  },
  {
    id: 6,
    name: "Zarina Nematova",
    email: "zarina.nematova@student.com",
    phone: "+998 90 678 90 12",
    group: 4,
    groupName: "UI/UX Design",
    avatar: "/avatars/student6.jpg",
    status: "active",
    enrollmentDate: "2024-02-10",
    progress: 88,
    attendance: 92
  },
  {
    id: 7,
    name: "Rustam Alimov",
    email: "rustam.alimov@student.com",
    phone: "+998 90 789 01 23",
    group: 5,
    groupName: "DevOps Engineering",
    avatar: "/avatars/student7.jpg",
    status: "active",
    enrollmentDate: "2024-02-15",
    progress: 72,
    attendance: 80
  },
  {
    id: 8,
    name: "Nodira Saidova",
    email: "nodira.saidova@student.com",
    phone: "+998 90 890 12 34",
    group: 1,
    groupName: "Web Development 101",
    avatar: "/avatars/student8.jpg",
    status: "graduated",
    enrollmentDate: "2023-09-01",
    progress: 100,
    attendance: 98
  }
]
