import { useQuery } from '@tanstack/react-query'
import { studentsData } from '@/data/students-data'
import type {
  StudentAssignment,
  StudentConversation,
  StudentCourse,
  StudentDashboardStats,
  StudentNotification,
  StudentProfile,
  StudentScheduleItem,
} from '@/types/student'

const getStoredUser = () => {
  if (typeof window === 'undefined') return null

  const raw = sessionStorage.getItem('linguapro_user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as Partial<StudentProfile>
  } catch {
    return null
  }
}

const buildProfile = (): StudentProfile => {
  const stored = getStoredUser()
  const username = stored?.username || stored?.full_name || 'Lingua Learner'
  const email = stored?.email || 'student@example.com'
  const phone = stored?.phone || '+998 90 123 45 67'

  return {
    id: stored?.id ?? 100,
    username,
    full_name: stored?.full_name || username,
    role: stored?.role ?? 'user',
    email,
    phone,
    avatar: '/avatars/student1.jpg',
    activeCourse: 'Advanced English Communication',
    nextLesson: 'Pronunciation lab with Ms. Ziya at 11:00 AM',
    completion: 82,
    attendance: 93,
    streak: 14,
    goal: 'Reach B2 fluency in 90 days',
  }
}

const courseGroups = Array.from(
  new Map(
    studentsData.map((item) => [item.groupName, item])
  ).entries()
)

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => buildProfile(),
    staleTime: 60_000,
  })
}

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: async () => {
      const profile = buildProfile()
      const activeCourses = courseGroups.length
      const completedHours = `${Math.max(40, Math.round(profile.completion * 0.8))}h`

      return {
        stats: {
          upcomingLessons: 3,
          completedHours,
          progress: profile.completion,
          unreadMessages: 5,
        } as StudentDashboardStats,
        highlights: [
          {
            title: 'Next lesson',
            value: profile.nextLesson,
          },
          {
            title: 'Current course',
            value: profile.activeCourse,
          },
          {
            title: 'Learning streak',
            value: `${profile.streak} days`,
          },
        ],
        quickActions: [
          {
            label: 'Join live class',
            description: 'Today at 11:00 AM',
          },
          {
            label: 'Review vocabulary',
            description: '20 min focused practice',
          },
        ],
      }
    },
    staleTime: 60_000,
  })
}

export const useStudentSchedule = () => {
  return useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: async (): Promise<StudentScheduleItem[]> => [
      {
        id: 1,
        day: 'Monday',
        time: '10:00 AM - 11:00 AM',
        title: 'Pronunciation Lab',
        location: 'Online Classroom',
        instructor: 'Ms. Ziya',
        status: 'Upcoming',
      },
      {
        id: 2,
        day: 'Wednesday',
        time: '2:00 PM - 3:00 PM',
        title: 'Grammar Workshop',
        location: 'Room 210',
        instructor: 'Mr. Eldor',
        status: 'Upcoming',
      },
      {
        id: 3,
        day: 'Friday',
        time: '4:00 PM - 5:00 PM',
        title: 'Conversation Practice',
        location: 'Study Hall',
        instructor: 'Mrs. Nilufar',
        status: 'Upcoming',
      },
    ],
    staleTime: 60_000,
  })
}

export const useStudentHomework = () => {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: async (): Promise<StudentAssignment[]> => [
      {
        id: 1,
        title: 'Module 4 Writing Assignment',
        course: 'Advanced English Communication',
        dueDate: 'May 4, 2026',
        status: 'Pending',
        completion: 65,
      },
      {
        id: 2,
        title: 'Pronunciation Reflection',
        course: 'Pronunciation Lab',
        dueDate: 'May 6, 2026',
        status: 'Submitted',
        completion: 100,
      },
      {
        id: 3,
        title: 'Vocabulary Drill',
        course: 'Grammar Workshop',
        dueDate: 'May 8, 2026',
        status: 'Late',
        completion: 45,
      },
    ],
    staleTime: 60_000,
  })
}

export const useStudentMessages = () => {
  return useQuery({
    queryKey: ['student', 'messages'],
    queryFn: async (): Promise<StudentConversation[]> => [
      {
        id: 1,
        participant: 'Ms. Ziya',
        subject: 'Pronunciation practice',
        lastMessage: 'I reviewed your homework and left feedback.',
        time: '2m ago',
        unread: 2,
        messages: [
          {
            id: 1,
            sender: 'teacher',
            body: 'Great progress today! Please review the new pronunciation set.',
            time: '2m ago',
          },
          {
            id: 2,
            sender: 'student',
            body: 'Thank you! I will complete it tonight.',
            time: '1m ago',
          },
        ],
      },
      {
        id: 2,
        participant: 'Support Bot',
        subject: 'Course resources',
        lastMessage: 'Your next lesson note is ready.',
        time: '1h ago',
        unread: 0,
        messages: [
          {
            id: 3,
            sender: 'teacher',
            body: 'Your lesson notes are ready in the portal.',
            time: '1h ago',
          },
        ],
      },
    ],
    staleTime: 60_000,
  })
}

export const useStudentCourses = () => {
  return useQuery({
    queryKey: ['student', 'courses'],
    queryFn: async (): Promise<StudentCourse[]> => [
      {
        id: 1,
        title: 'Advanced English Communication',
        instructor: 'Ms. Ziya',
        progress: 82,
        duration: '24 lessons',
        nextModule: 'Pronunciation practice',
        badge: 'Core course',
      },
      {
        id: 2,
        title: 'Grammar Workshop',
        instructor: 'Mr. Eldor',
        progress: 68,
        duration: '18 lessons',
        nextModule: 'Conditional sentences',
        badge: 'Elective',
      },
      {
        id: 3,
        title: 'Conversation Practice',
        instructor: 'Mrs. Nilufar',
        progress: 90,
        duration: '12 lessons',
        nextModule: 'Role play session',
        badge: 'Live cohort',
      },
    ],
    staleTime: 60_000,
  })
}

export const useStudentNotifications = () => {
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: async (): Promise<StudentNotification[]> => [
      {
        id: 1,
        title: 'Lesson reminder',
        description: 'Your Pronunciation Lab starts in 45 minutes.',
        time: '10 min ago',
        category: 'Reminder',
        read: false,
      },
      {
        id: 2,
        title: 'Feedback available',
        description: 'Your instructor has left comments on your assignment.',
        time: '1h ago',
        category: 'Update',
        read: false,
      },
      {
        id: 3,
        title: 'New course module',
        description: 'A new speaking module is waiting for you.',
        time: 'Yesterday',
        category: 'Announcement',
        read: true,
      },
    ],
    staleTime: 60_000,
  })
}
