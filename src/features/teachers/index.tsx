import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { teacherGroupsData, type Student } from '@/data/groups-data'
import { teachersData } from '@/data/teachers-data'
import {
  Calendar,
  Edit,
  MapPin,
  SearchIcon,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { GroupModal } from '@/components/GroupModal'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

// --- Interfaces ---
interface Teacher {
  id: number
  name: string
  initials: string
  subject: string
  email?: string
  level?: string
  badgeColor: {
    bg: string
    text: string
    border: string
    avatarBg: string
    avatarFill: string
  }
  phone: string
  groups: number
  experience: number
  rating: number
  avatar?: string
}

// Mock data for students with activity
const studentsData: Student[] = [
  {
    id: 1,
    name: 'Asadbek Azizov',
    phone: '+998 90 123 45 67',
    attendance: 'present',
    activity: 95,
  },
  {
    id: 2,
    name: 'Dilnoza Karimova',
    phone: '+998 91 234 56 78',
    attendance: 'late',
    activity: 88,
  },
  {
    id: 3,
    name: 'Bekzod Toshmatov',
    phone: '+998 93 345 67 89',
    attendance: 'absent',
    activity: 72,
  },
  {
    id: 4,
    name: 'Malika Xolmatova',
    phone: '+998 94 456 78 90',
    attendance: 'present',
    activity: 92,
  },
  {
    id: 5,
    name: 'Javlon Umarov',
    phone: '+998 95 567 89 01',
    attendance: 'present',
    activity: 98,
  },
]

type ViewState = 'teachers' | 'groups' | 'students'

// --- Helper function to convert teachers data ---
const convertTeachersData = (teachers: typeof teachersData): Teacher[] => {
  return teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    initials: teacher.name
      .split(' ')
      .map((n) => n[0])
      .join(''),
    subject: teacher.subject,
    badgeColor: {
      bg: '#fff1f2',
      text: '#e11d48',
      border: '#fda4af',
      avatarBg: '#fff1f2',
      avatarFill: '#fb7185',
    },
    phone: teacher.phone,
    groups: teacher.groups.length,
    experience: parseInt(teacher.experience) || 0,
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    avatar: teacher.avatar,
  }))
}

const mockTeachers = convertTeachersData(teachersData)

// --- Icons ---
const PhoneIcon = () => (
  <svg
    width={13}
    height={13}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 14a16 16 0 006.09 6.09l.41-.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z' />
  </svg>
)

const AvatarSilhouette = ({ fill }: { fill: string }) => (
  <svg viewBox='0 0 24 24' fill='none' width={28} height={28}>
    <path
      d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'
      stroke={fill}
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='12' cy='7' r='4' fill={fill} />
  </svg>
)

// --- Helper Components ---
const ActionButton = ({
  onClick,
  color,
  icon,
}: {
  onClick: (e: React.MouseEvent) => void
  color: 'blue' | 'purple' | 'red'
  icon: React.ReactNode
}) => {
  const [hovered, setHovered] = useState(false)
  const colors = {
    blue: { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    purple: { text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    red: { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  }
  const c = colors[color]

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: 10,
        border: `1px solid ${hovered ? c.border : 'var(--border-primary, #e5e7eb)'}`,
        background: hovered ? c.bg : 'transparent',
        color: hovered ? c.text : '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {icon}
    </button>
  )
}

const EditIcon = () => (
  <svg
    width={13}
    height={13}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path d='M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' />
  </svg>
)

const DetailIcon = () => (
  <svg
    width={13}
    height={13}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
  >
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='8' x2='12' y2='12' />
    <line x1='12' y1='16' x2='12.01' y2='16' />
  </svg>
)

const DeleteIcon = () => (
  <svg
    width={13}
    height={13}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
  >
    <polyline points='3 6 5 6 21 6' />
    <path d='M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2' />
  </svg>
)

function TeacherCard({
  teacher,
  onEdit,
  onDelete,
  onDetail,
  onClick,
}: {
  teacher: Teacher
  onEdit: (teacher: Teacher) => void
  onDelete: (teacher: Teacher) => void
  onDetail: (teacher: Teacher) => void
  onClick?: (teacher: Teacher) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick ? () => onClick(teacher) : undefined}
      style={{
        background: 'var(--bg-primary, #fff)',
        border: `1px solid ${hovered ? '#e5e7eb' : 'var(--border-primary, #f1f5f9)'}`,
        borderRadius: 20,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered
          ? '0 12px 24px -8px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.02)'
          : '0 2px 4px 0 rgba(0,0,0,0.02)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: teacher.badgeColor.avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${teacher.badgeColor.border}40`,
            overflow: 'hidden',
          }}
        >
          {teacher.avatar && !imageError ? (
            <img
              src={teacher.avatar}
              alt={teacher.name}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <AvatarSilhouette fill={teacher.badgeColor.avatarFill} />
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1e293b',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {teacher.name}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              display: 'inline-block',
              background: teacher.badgeColor.bg,
              color: teacher.badgeColor.text,
            }}
          >
            {teacher.subject}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#64748b',
          fontSize: 13,
        }}
      >
        <PhoneIcon />
        <span>{teacher.phone}</span>
      </div>

      <div style={{ height: '1px', background: '#f1f5f9' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
            GURUHLAR
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {teacher.groups}{' '}
            <small style={{ fontWeight: 400, fontSize: 12 }}>ta</small>
          </div>
        </div>
        <div style={{ paddingLeft: 12, borderLeft: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
            TAJRIBA
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {teacher.experience}{' '}
            <small style={{ fontWeight: 400, fontSize: 12 }}>yil</small>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <ActionButton
          onClick={(e) => {
            e.stopPropagation()
            onEdit(teacher)
          }}
          color='blue'
          icon={<EditIcon />}
        />
        <ActionButton
          onClick={(e) => {
            e.stopPropagation()
            onDetail(teacher)
          }}
          color='purple'
          icon={<DetailIcon />}
        />
        <ActionButton
          onClick={(e) => {
            e.stopPropagation()
            onDelete(teacher)
          }}
          color='red'
          icon={<DeleteIcon />}
        />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          if (onClick) onClick(teacher)
        }}
        style={{
          width: '100%',
          padding: '12px',
          background: '#e11d48',
          color: '#fff',
          border: 'none',
          borderRadius: 25,
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#be123c'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#e11d48'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <svg
          width={16}
          height={16}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2.5}
        >
          <path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' />
          <circle cx='9' cy='7' r='4' />
          <path d='M23 21v-2a4 4 0 00-3-3.87' />
          <path d='M16 3.13a4 4 0 010 7.75' />
        </svg>
        Ustozning guruhlarini ko'rish
      </button>
    </div>
  )
}

// --- Main Page ---
export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const savedTeachers = localStorage.getItem('teachers')
    return savedTeachers ? JSON.parse(savedTeachers) : mockTeachers
  })
  const { addToast, ToastContainer } = useToast()

  // Groups functionality states
  const [viewState, setViewState] = useState<ViewState>('teachers')
  const [selectedTeacherForGroups, setSelectedTeacherForGroups] =
    useState<Teacher | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<{
    id: number
    name: string
    teacher: string
    schedule: string
    students: number
    room: string
  } | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>(studentsData)

  // Group modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    schedule: '',
    room: '',
    students: 0,
  })

  // Add student modal state
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '',
    phone: '',
    attendance: 'present',
    password: '',
    confirmPassword: '',
  })

  // Student search state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(
    null
  )

  // Teacher modals state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '',
    experience: '',
    avatar: '',
  })
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '',
    experience: '',
    avatar: '',
  })

  const getFilteredGroups = () => {
    if (!selectedTeacherForGroups) return []

    try {
      // Get saved groups from localStorage
      const savedGroups = JSON.parse(
        localStorage.getItem('teacherGroups') || '{}'
      )
      const teacherSavedGroups = savedGroups[selectedTeacherForGroups.id] || []

      // Get default groups from data file
      const defaultTeacherGroups = teacherGroupsData[
        selectedTeacherForGroups.id as keyof typeof teacherGroupsData
      ] || [
        {
          id: 7,
          name: 'General Course',
          teacher: selectedTeacherForGroups.name,
          schedule: 'Dushanba-Chorshanba 09:00-11:00',
          students: 12,
          room: '201',
          description: 'General English course',
        },
      ]

      // Update teacher name in default groups
      const updatedDefaultGroups = defaultTeacherGroups.map(
        (group: {
          id: number
          name: string
          teacher: string
          schedule: string
          students: number
          room: string
          description?: string
        }) => ({
          ...group,
          teacher: selectedTeacherForGroups.name,
        })
      )

      // Combine default groups with saved groups
      return [...updatedDefaultGroups, ...teacherSavedGroups]
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in getFilteredGroups:', error)
      return []
    }
  }

  const handleGroupSelect = (group: {
    id: number
    name: string
    teacher: string
    schedule: string
    students: number
    room: string
  }) => {
    setSelectedGroup(group)
    // Set group-specific students
    const groupStudents = getGroupStudents(group.id)
    setStudents(groupStudents)
    setViewState('students')
  }

  const getGroupStudents = (groupId: number) => {
    try {
      // First check localStorage for saved students
      const savedStudents = JSON.parse(
        localStorage.getItem('groupStudents') || '{}'
      )
      if (savedStudents[groupId]) {
        return savedStudents[groupId]
      }

      // Create default students for any group
      const defaultStudents = [
        {
          id: groupId * 100 + 1,
          name: `Student ${groupId}-1`,
          phone: '+998 90 000 00 01',
          attendance: 'present',
          activity: 85,
        },
        {
          id: groupId * 100 + 2,
          name: `Student ${groupId}-2`,
          phone: '+998 90 000 00 02',
          attendance: 'present',
          activity: 90,
        },
        {
          id: groupId * 100 + 3,
          name: `Student ${groupId}-3`,
          phone: '+998 90 000 00 03',
          attendance: 'late',
          activity: 78,
        },
      ]

      return defaultStudents
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in getGroupStudents:', error)
      return []
    }
  }

  const handleAttendanceChange = (
    studentId: number,
    status: 'present' | 'late' | 'absent'
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attendance: status } : student
      )
    )
  }

  const handleAddGroup = () => {
    if (
      !selectedTeacherForGroups ||
      !newGroup.name ||
      !newGroup.schedule ||
      !newGroup.room
    ) {
      alert('Please fill in all required fields')
      return
    }

    // Get existing groups from localStorage
    const existingGroups = JSON.parse(
      localStorage.getItem('teacherGroups') || '{}'
    )

    // Get or create groups for this teacher
    const teacherGroups = existingGroups[selectedTeacherForGroups.id] || []

    // Create new group
    const groupToAdd = {
      id:
        Math.max(...teacherGroups.map((g: { id?: number }) => g.id || 0), 0) +
        1,
      name: newGroup.name,
      description: newGroup.description,
      schedule: newGroup.schedule,
      students: newGroup.students,
      room: newGroup.room,
      teacher: selectedTeacherForGroups.name,
    }

    // Add to teacher's groups
    teacherGroups.push(groupToAdd)
    existingGroups[selectedTeacherForGroups.id] = teacherGroups

    // Create mock students for the new group
    const newGroupStudents = createMockStudentsForGroup(
      groupToAdd.id,
      newGroup.students || 5
    )

    // Save students to localStorage
    const existingStudents = JSON.parse(
      localStorage.getItem('groupStudents') || '{}'
    )
    existingStudents[groupToAdd.id] = newGroupStudents
    localStorage.setItem('groupStudents', JSON.stringify(existingStudents))

    // Save to localStorage
    localStorage.setItem('teacherGroups', JSON.stringify(existingGroups))

    // Update teacher's group count in state
    if (selectedTeacherForGroups) {
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.id === selectedTeacherForGroups.id
            ? { ...teacher, groups: teacher.groups + 1 }
            : teacher
        )
      )
    }

    // Reset form and close modal
    setNewGroup({
      name: '',
      description: '',
      schedule: '',
      room: '',
      students: 0,
    })
    setGroupModalOpen(false)
    addToast(`"${newGroup.name}" group added successfully`, 'success')

    // Force re-render of groups list by updating a dummy state
    setViewState((prev) => (prev === 'groups' ? 'groups' : 'groups'))
  }

  const handleSearchStudents = (query: string) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // If search is empty, show all students immediately (no debounce)
    if (!query.trim()) {
      const groupStudents = getGroupStudents(selectedGroup?.id || 0)
      setStudents(groupStudents)
      return
    }

    // Set new timeout for debouncing non-empty searches
    const timeout = setTimeout(() => {
      // Local filtering only - no API calls
      const groupStudents = getGroupStudents(selectedGroup?.id || 0)
      const filtered = groupStudents.filter(
        (student: Student) =>
          student.name.toLowerCase().includes(query.toLowerCase()) ||
          student.phone.includes(query)
      )
      setStudents(filtered)
    }, 300) // 300ms debounce delay

    setSearchTimeout(timeout)
  }

  const handleAddStudent = () => {
    const trimmedName = newStudent.name.trim()
    const trimmedPhone = newStudent.phone.trim()
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'’\- ]{2,50}$/
    const phoneRegex = /^[+]?([\d\s()-]){9,25}$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

    if (!trimmedName || !trimmedPhone) {
      alert('Please enter the student name and phone number.')
      return
    }

    if (!nameRegex.test(trimmedName)) {
      alert('Name should be 2-50 letters and may include spaces, hyphens, or apostrophes.')
      return
    }

    if (!phoneRegex.test(trimmedPhone)) {
      alert('Phone number must contain only digits, spaces, +, parentheses, or hyphens.')
      return
    }

    const digitsOnlyPhone = trimmedPhone.replace(/\D/g, '')
    if (digitsOnlyPhone.length < 9 || digitsOnlyPhone.length > 15) {
      alert('Phone number must include 9 to 15 digits.')
      return
    }

    if (!newStudent.password || !newStudent.confirmPassword) {
      alert('Please enter and confirm the password.')
      return
    }

    if (!passwordRegex.test(newStudent.password)) {
      alert('Password must be at least 8 characters and include uppercase, lowercase, and a digit.')
      return
    }

    if (newStudent.password !== newStudent.confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    if (!selectedGroup) return

    // Create new student
    const studentToAdd: Student = {
      id: Date.now(), // Unique ID based on timestamp
      name: trimmedName,
      phone: trimmedPhone,
      attendance: newStudent.attendance as 'present' | 'late' | 'absent',
      activity: 85,
    }

    // Add to students state
    setStudents((prev) => [...prev, studentToAdd])

    // Save to localStorage
    try {
      const existingStudents = JSON.parse(
        localStorage.getItem('groupStudents') || '{}'
      )
      if (!existingStudents[selectedGroup.id]) {
        existingStudents[selectedGroup.id] = []
      }
      existingStudents[selectedGroup.id].push(studentToAdd)
      localStorage.setItem('groupStudents', JSON.stringify(existingStudents))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving student:', error)
    }

    // Reset form and close modal
    setNewStudent({
      name: '',
      phone: '',
      attendance: 'present',
      password: '',
      confirmPassword: '',
    })
    setAddStudentModalOpen(false)
    addToast(`"${newStudent.name}" student added successfully`, 'success')
  }

  const handleStudentActivity = (student: Student) => {
    setSelectedStudent(student)
  }

  const handleAdd = () => {
    setAddFormData({
      name: '',
      email: '',
      phone: '',
      level: '',
      experience: '',
      avatar: '',
    })
    setAddModalOpen(true)
  }

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setEditFormData({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone,
      level: teacher.level || '',
      experience: teacher.experience.toString(),
      avatar: teacher.avatar || '',
    })
    setEditModalOpen(true)
  }

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDeleteModalOpen(true)
  }

  const handleDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDetailModalOpen(true)
  }

  const handleEditSave = () => {
    if (!selectedTeacher) return

    const updatedTeachers = teachers.map((teacher) =>
      teacher.id === selectedTeacher.id
        ? {
            ...teacher,
            name: editFormData.name,
            subject: teacher.subject, // Keep original subject since it's not in edit form
            email: editFormData.email,
            phone: editFormData.phone,
            level: editFormData.level,
            experience: parseInt(editFormData.experience) || 0,
            avatar: editFormData.avatar,
          }
        : teacher
    )

    setTeachers(updatedTeachers)
    localStorage.setItem('teachers', JSON.stringify(updatedTeachers))
    setEditModalOpen(false)
    setSelectedTeacher(null)
    addToast(
      `Ustoz "${editFormData.name}" muvaffaqiyatli yangilandi`,
      'success'
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedTeacher) return

    const updatedTeachers = teachers.filter(
      (teacher) => teacher.id !== selectedTeacher.id
    )

    setTeachers(updatedTeachers)
    localStorage.setItem('teachers', JSON.stringify(updatedTeachers))
    setDeleteModalOpen(false)
    setSelectedTeacher(null)
    addToast(
      `Teacher "${selectedTeacher.name}" deleted successfully`,
      'success'
    )
  }

  const handleAddSave = () => {
    if (!addFormData.name || !addFormData.phone || !addFormData.experience) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring")
      return
    }

    const newTeacher: Teacher = {
      id: Date.now(), // Unique ID based on timestamp
      name: addFormData.name,
      initials: addFormData.name
        .split(' ')
        .map((n) => n[0])
        .join(''),
      subject: 'General', // Default subject
      email: addFormData.email,
      level: addFormData.level,
      badgeColor: {
        bg: '#fff1f2',
        text: '#e11d48',
        border: '#fda4af',
        avatarBg: '#fff1f2',
        avatarFill: '#fb7185',
      },
      phone: addFormData.phone,
      groups: 0,
      experience: parseInt(addFormData.experience) || 0,
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      avatar: addFormData.avatar,
    }

    const updatedTeachers = [...teachers, newTeacher]
    setTeachers(updatedTeachers)
    localStorage.setItem('teachers', JSON.stringify(updatedTeachers))

    // Reset form data
    setAddFormData({
      name: '',
      email: '',
      phone: '',
      level: '',
      experience: '',
      avatar: '',
    })

    // Close modal
    setAddModalOpen(false)
    addToast(`Ustoz "${addFormData.name}" muvaffaqiyatli qo'shildi`, 'success')
  }

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacherForGroups(teacher)
    setViewState('groups')
  }

  const createMockStudentsForGroup = (groupId: number, count: number) => {
    const firstNames = [
      'Ali',
      'Dilnoza',
      'Bekzod',
      'Malika',
      'Javlon',
      'Sardor',
      'Nodira',
      'Aziz',
      'Gulnara',
      'Rustam',
      'Zarina',
      'Bobur',
      'Kamola',
      'Farrux',
      'Laylo',
      'Bahodir',
      'Munira',
      'Jahongir',
      'Dildora',
      'Shukurullo',
    ]
    const lastNames = [
      'Karimov',
      'Saidova',
      'Toshmatov',
      'Xolmatova',
      'Umarov',
      'Rahimov',
      'Bekova',
      'Nazarov',
      'Karimova',
      'Alimov',
      'Tosheva',
      'Akbarov',
      'Umarova',
      'Saidov',
      'Hamroqulova',
      'Ruziev',
      'Azizova',
      'Otajonov',
      'Alikulova',
      'Tursunov',
    ]

    const mockStudentsList = []
    const startId = groupId * 100

    for (let i = 0; i < count; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const attendanceStatuses = ['present', 'late', 'absent']
      const attendance =
        attendanceStatuses[
          Math.floor(Math.random() * attendanceStatuses.length)
        ]

      mockStudentsList.push({
        id: startId + i,
        name: `${firstName} ${lastName}`,
        phone: `+998 ${90 + Math.floor(Math.random() * 6)} ${Math.floor(
          Math.random() * 100000000
        )
          .toString()
          .padStart(8, '0')}`,
        attendance: attendance as 'present' | 'late' | 'absent',
        activity: 70 + Math.floor(Math.random() * 30),
      })
    }

    return mockStudentsList
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div
          style={{
            padding: '24px 32px 0',
            fontSize: 11,
            color: '#94a3b8',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          <Link to='/'>Dashboard</Link> /{' '}
          <span style={{ color: '#e11d48' }}>
            {viewState === 'teachers' && 'TEACHERS'}
            {viewState === 'groups' && 'TEACHER GROUPS'}
            {viewState === 'students' && 'GROUP STUDENTS'}
          </span>
        </div>

        {/* Teachers View */}
        {viewState === 'teachers' && (
          <>
            <div style={{ padding: '12px 32px 24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Teacher Team
                  </h1>
                  <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                    LinguaPro qualified teachers management panel
                  </p>
                </div>
                <Button
                  onClick={handleAdd}
                  style={{
                    background: '#e11d48',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 25,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#be123c'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#e11d48'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                  >
                    <line x1='12' y1='5' x2='12' y2='19' />
                    <line x1='5' y1='12' x2='19' y2='12' />
                  </svg>
                  New Teacher
                </Button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 20,
                padding: '0 32px',
              }}
            >
              {teachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDetail={handleDetail}
                  onClick={handleTeacherSelect}
                />
              ))}
            </div>
          </>
        )}

        {/* Groups View */}
        {viewState === 'groups' && selectedTeacherForGroups && (
          <>
            <div className='container mx-auto space-y-6 p-6'>
              <div className='mb-6'>
                <div className='mb-2 flex items-center gap-4'>
                  <Button
                    onClick={() => setViewState('teachers')}
                    style={{
                      background: '#e11d48',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 25,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#be123c'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#e11d48'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    ← Back
                  </Button>
                  <h1 className='text-3xl font-bold'>
                    {selectedTeacherForGroups.name} - Groups
                  </h1>
                </div>
                <p className='text-muted-foreground'>
                  Select a group and view student list
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Groups List</CardTitle>
                    <Button
                      onClick={() => setGroupModalOpen(true)}
                      style={{
                        background: '#e11d48',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 25,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#be123c'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#e11d48'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={2.5}
                      >
                        <line x1='12' y1='5' x2='12' y2='19' />
                        <line x1='5' y1='12' x2='19' y2='12' />
                      </svg>
                      Add Group
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredGroups().map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                                <Users className='h-5 w-5 text-green-600' />
                              </div>
                              <div>
                                <div className='font-semibold'>
                                  {group.name}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {selectedTeacherForGroups.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {group.description}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {group.schedule}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4 text-gray-500' />
                              <span>{group.schedule}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <MapPin className='h-4 w-4 text-gray-500' />
                              <span>Room {group.room}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='text-center'>
                              <div className='font-semibold'>
                                {group.students}
                              </div>
                              <div className='text-sm text-gray-500'>
                                students
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => handleGroupSelect(group)}
                              >
                                <Users className='h-3 w-3' />
                              </Button>
                              <Button size='sm' variant='outline'>
                                <Edit className='h-3 w-3' />
                              </Button>
                              <Button size='sm' variant='outline'>
                                <Trash2 className='h-3 w-3' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Students View */}
        {viewState === 'students' && selectedGroup && (
          <>
            <div className='container mx-auto space-y-6 p-6'>
              <div className='mb-6'>
                <div className='mb-2 flex items-center gap-4'>
                  <Button
                    onClick={() => setViewState('groups')}
                    style={{
                      background: '#e11d48',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 25,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#be123c'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#e11d48'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    ← Back
                  </Button>
                  <h1 className='text-3xl font-bold'>
                    {selectedGroup.name} - Students
                  </h1>
                </div>
                <p className='text-muted-foreground'>
                  Manage student attendance
                </p>
              </div>

              <div style={{ padding: '0 16px' }}>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <h3
                      style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}
                    >
                      Students List
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div className='relative'>
                        <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                        <Input
                          placeholder='Search...'
                          className='w-64 pl-10'
                          value={searchTerm}
                          onChange={(e) => {
                            const value = e.target.value
                            setSearchTerm(value)
                            handleSearchStudents(value)
                          }}
                        />
                      </div>
                      <Button
                        onClick={() => setAddStudentModalOpen(true)}
                        style={{
                          background: '#e11d48',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: 25,
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#be123c'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#e11d48'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <svg
                          width={16}
                          height={16}
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2.5}
                        >
                          <line x1='12' y1='5' x2='12' y2='19' />
                          <line x1='5' y1='12' x2='19' y2='12' />
                        </svg>
                        Add Student
                      </Button>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          Phone
                        </th>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          Attendance
                        </th>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          Activity
                        </th>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, _index) => (
                        <tr
                          key={student.id}
                          style={{ borderBottom: '1px solid #f1f5f9' }}
                        >
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                          >
                            {student.name}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '14px',
                              color: '#64748b',
                            }}
                          >
                            {student.phone}
                          </td>
                          <td style={{ padding: '8px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student.id, 'present')
                                }
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background:
                                    student.attendance === 'present'
                                      ? '#22c55e'
                                      : '#f1f5f9',
                                  color:
                                    student.attendance === 'present'
                                      ? '#fff'
                                      : '#64748b',
                                }}
                              >
                                Present
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student.id, 'late')
                                }
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background:
                                    student.attendance === 'late'
                                      ? '#f59e0b'
                                      : '#f1f5f9',
                                  color:
                                    student.attendance === 'late'
                                      ? '#fff'
                                      : '#64748b',
                                }}
                              >
                                Late
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student.id, 'absent')
                                }
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background:
                                    student.attendance === 'absent'
                                      ? '#ef4444'
                                      : '#f1f5f9',
                                  color:
                                    student.attendance === 'absent'
                                      ? '#fff'
                                      : '#64748b',
                                }}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleStudentActivity(student)}
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <TrendingUp className='h-4 w-4' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Student Activity Modal/Card */}
              {selectedStudent && (
                <Card className='border-blue-200 bg-blue-50'>
                  <CardContent className='p-6'>
                    <div className='mb-4 flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>
                        {selectedStudent.name} - Activity
                      </h3>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setSelectedStudent(null)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                      <div className='text-center'>
                        <div className='text-3xl font-bold text-blue-600'>
                          {selectedStudent.activity}%
                        </div>
                        <p className='text-sm text-gray-600'>
                          Overall Activity
                        </p>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-green-600'>
                          24/30
                        </div>
                        <p className='text-sm text-gray-600'>
                          Class Attendance
                        </p>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-purple-600'>
                          A+
                        </div>
                        <p className='text-sm text-gray-600'>Grade</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Cards */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>
                          Average Attendance
                        </p>
                        <p className='text-2xl font-bold text-green-600'>
                          {Math.round(
                            (students.filter((s) => s.attendance === 'present')
                              .length /
                              students.length) *
                              100
                          )}
                          %
                        </p>
                      </div>
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                        <Users className='h-6 w-6 text-green-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>
                          Most Active Student
                        </p>
                        <p className='text-lg font-semibold'>
                          {
                            students
                              .reduce((prev, current) =>
                                prev.activity > current.activity
                                  ? prev
                                  : current
                              )
                              .name.split(' ')[0]
                          }
                          .
                        </p>
                      </div>
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                        <Users className='h-6 w-6 text-blue-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>Total Classes</p>
                        <p className='text-2xl font-bold'>24/48</p>
                      </div>
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100'>
                        <Calendar className='h-6 w-6 text-purple-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </Main>

      {/* Group Modal */}
      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onAddGroup={handleAddGroup}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
      />

      {/* Add Student Modal */}
      {addStudentModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setAddStudentModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '18px',
              padding: '28px',
              width: '92%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
              border: '1px solid rgba(229, 231, 235, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '18px',
                color: '#111827',
              }}
            >
              Add New Student
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Enter student details and set a secure password before adding them to the group.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddStudent()
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Name *
                </label>
                <Input
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='e.g., John Smith'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Phone Number *
                </label>
                <Input
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder='e.g., +998 90 123 45 67'
                  pattern='^[+]?([0-9\s()-]){9,25}$'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Password *
                </label>
                <Input
                  type='password'
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder='••••••••'
                  pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
                  title='At least 8 characters, including uppercase, lowercase, and a number.'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Confirm Password *
                </label>
                <Input
                  type='password'
                  value={newStudent.confirmPassword}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder='••••••••'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Attendance
                </label>
                <select
                  value={newStudent.attendance}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      attendance: e.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  <option value='present'>Present</option>
                  <option value='late'>Late</option>
                  <option value='absent'>Absent</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setAddStudentModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  style={{
                    flex: 1,
                    background: '#e11d48',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Add Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Add Modal */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setAddModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1f2937',
                }}
              >
                Ustoz qo'shish
              </h2>
              <button
                onClick={() => setAddModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddSave()
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Avatar Upload Section */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 12px',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: '#f9fafb',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    document.getElementById('avatar-upload-add')?.click()
                  }
                >
                  {addFormData.avatar ? (
                    <img
                      src={addFormData.avatar}
                      alt='Avatar'
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width={32}
                        height={32}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#9ca3af'
                        strokeWidth={2}
                      >
                        <path d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z' />
                        <path d='M12 22V8M8 12h8' />
                      </svg>
                      <svg
                        width={20}
                        height={20}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#9ca3af'
                        strokeWidth={2}
                        style={{ position: 'absolute', bottom: 8, right: 8 }}
                      >
                        <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l3-3h6l3 3h3a2 2 0 0 1 2 2z' />
                        <circle cx='12' cy='13' r='4' />
                      </svg>
                    </>
                  )}
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setAddFormData((prev) => ({
                            ...prev,
                            avatar: reader.result as string,
                          }))
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    style={{ display: 'none' }}
                    id='avatar-upload-add'
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '600',
                  }}
                >
                  AVATAR YUKLASH
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  To'liq ism (F.I.SH) *
                </label>
                <Input
                  value={addFormData.name}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Masalan: Alisher Navoiy'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Email manzili
                </label>
                <Input
                  type='email'
                  value={addFormData.email}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder='example@linguapro.uz'
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Telefon raqami *
                </label>
                <Input
                  value={addFormData.phone}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder='+998 90 123 45 67'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  O'qituvchi darajasi
                </label>
                <select
                  value={addFormData.level}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      level: e.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  <option value=''>Darajani tanlang</option>
                  <option value='Beginner'>Beginner</option>
                  <option value='Elementary'>Elementary</option>
                  <option value='Intermediate'>Intermediate</option>
                  <option value='Upper-Intermediate'>Upper-Intermediate</option>
                  <option value='Advanced'>Advanced</option>
                  <option value='Proficient'>Proficient</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Tajriba (yil) *
                </label>
                <Input
                  type='number'
                  min='0'
                  value={addFormData.experience}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  placeholder='Yillarda kiriting'
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setAddModalOpen(false)}
                  style={{
                    flex: 1,
                    background: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: '500',
                  }}
                >
                  Bekor qilish
                </Button>
                <Button
                  type='submit'
                  style={{
                    flex: 1,
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: '500',
                  }}
                >
                  Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Edit Modal */}
      {editModalOpen && selectedTeacher && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setEditModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1f2937',
                }}
              >
                Ustozni tahrirlash
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditSave()
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Avatar Upload Section */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 12px',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: '#f9fafb',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    document.getElementById('avatar-upload-edit')?.click()
                  }
                >
                  {editFormData.avatar ? (
                    <img
                      src={editFormData.avatar}
                      alt='Avatar'
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width={32}
                        height={32}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#9ca3af'
                        strokeWidth={2}
                      >
                        <path d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z' />
                        <path d='M12 22V8M8 12h8' />
                      </svg>
                      <svg
                        width={20}
                        height={20}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#9ca3af'
                        strokeWidth={2}
                        style={{ position: 'absolute', bottom: 8, right: 8 }}
                      >
                        <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l3-3h6l3 3h3a2 2 0 0 1 2 2z' />
                        <circle cx='12' cy='13' r='4' />
                      </svg>
                    </>
                  )}
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setEditFormData((prev) => ({
                            ...prev,
                            avatar: reader.result as string,
                          }))
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    style={{ display: 'none' }}
                    id='avatar-upload-edit'
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '600',
                  }}
                >
                  AVATAR YUKLASH
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  To'liq ism (F.I.SH) *
                </label>
                <Input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Masalan: Alisher Navoiy'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Email manzili
                </label>
                <Input
                  type='email'
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder='example@linguapro.uz'
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Telefon raqami *
                </label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder='+998 90 123 45 67'
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  O'qituvchi darajasi
                </label>
                <select
                  value={editFormData.level}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      level: e.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  <option value=''>Darajani tanlang</option>
                  <option value='Beginner'>Beginner</option>
                  <option value='Elementary'>Elementary</option>
                  <option value='Intermediate'>Intermediate</option>
                  <option value='Upper-Intermediate'>Upper-Intermediate</option>
                  <option value='Advanced'>Advanced</option>
                  <option value='Proficient'>Proficient</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Tajriba (yil) *
                </label>
                <Input
                  type='number'
                  min='0'
                  value={editFormData.experience}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  placeholder='Yillarda kiriting'
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    flex: 1,
                    background: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: '500',
                  }}
                >
                  Bekor qilish
                </Button>
                <Button
                  type='submit'
                  style={{
                    flex: 1,
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: '500',
                  }}
                >
                  Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Detail Modal */}
      {detailModalOpen && selectedTeacher && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: selectedTeacher.badgeColor.avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${selectedTeacher.badgeColor.border}40`,
                  overflow: 'hidden',
                }}
              >
                {selectedTeacher.avatar ? (
                  <img
                    src={selectedTeacher.avatar}
                    alt={selectedTeacher.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <AvatarSilhouette
                    fill={selectedTeacher.badgeColor.avatarFill}
                  />
                )}
              </div>
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  {selectedTeacher.name}
                </h2>
              </div>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneIcon />
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  {selectedTeacher.phone}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    GROUPS
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}
                  >
                    {selectedTeacher.groups}
                  </div>
                </div>
                <div
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    EXPERIENCE
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}
                  >
                    {selectedTeacher.experience} years
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setDetailModalOpen(false)}
                style={{
                  width: '100%',
                  background: '#e11d48',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Delete Confirmation Modal */}
      {deleteModalOpen && selectedTeacher && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Trash2 style={{ width: 24, height: 24, color: '#dc2626' }} />
              </div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0,
                  marginBottom: '8px',
                }}
              >
                Delete Teacher
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Are you sure you want to delete "{selectedTeacher.name}"? This
                action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                type='button'
                variant='outline'
                onClick={() => setDeleteModalOpen(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type='button'
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <ToastContainer />
    </>
  )
}
