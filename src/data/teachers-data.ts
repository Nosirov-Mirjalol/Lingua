export interface Teacher {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  experience: string
  groups: number[]
  avatar?: string
  status: 'active' | 'inactive'
  hireDate?: string
}

export const teachersData: Teacher[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@linguapro.com',
    phone: '+998 90 123 45 67',
    subject: 'Web Development',
    experience: '5 yil',
    groups: [1, 7],
    avatar: '/avatars/teacher1.jpg',
    status: 'active',
    hireDate: '2020-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@linguapro.com',
    phone: '+998 90 234 56 78',
    subject: 'Mobile Development',
    experience: '3 yil',
    groups: [2],
    avatar: '/avatars/teacher2.jpg',
    status: 'active',
    hireDate: '2021-03-20',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@linguapro.com',
    phone: '+998 90 345 67 89',
    subject: 'Data Science',
    experience: '7 yil',
    groups: [3, 9],
    avatar: '/avatars/teacher3.jpg',
    status: 'inactive',
    hireDate: '2019-06-10',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@linguapro.com',
    phone: '+998 90 456 78 90',
    subject: 'UI/UX Design',
    experience: '4 yil',
    groups: [4, 8],
    avatar: '/avatars/teacher4.jpg',
    status: 'active',
    hireDate: '2020-09-15',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@linguapro.com',
    phone: '+998 90 567 89 01',
    subject: 'DevOps',
    experience: '6 yil',
    groups: [5, 10],
    avatar: '/avatars/teacher5.jpg',
    status: 'active',
    hireDate: '2019-11-20',
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@linguapro.com',
    phone: '+998 90 678 90 12',
    subject: 'Backend Development',
    experience: '8 yil',
    groups: [6],
    avatar: '/avatars/teacher6.jpg',
    status: 'active',
    hireDate: '2018-05-10',
  },
]
