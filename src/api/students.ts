// Student API endpoints for backend integration

export interface Student {
  id: number
  name: string
  phone: string
  attendance: 'present' | 'late' | 'absent'
  activity: number
}

export interface SearchResponse {
  students: Student[]
  total: number
}

// Mock API function - replace with actual backend API
export const searchStudents = async (
  query: string,
  _groupId?: number
): Promise<SearchResponse> => {
  try {
    // Simulate API delay (reduced for faster search)
    await new Promise((resolve) => setTimeout(resolve, 100))

    // In production, this would be an actual API call:
    // const response = await fetch(`/api/students/search?query=${encodeURIComponent(query)}&groupId=${_groupId}`)
    // return await response.json()

    // For now, return mock data
    const mockStudents: Student[] = [
      {
        id: 1,
        name: 'John Smith',
        phone: '+998 90 123 45 67',
        attendance: 'present',
        activity: 95,
      },
      {
        id: 2,
        name: 'Jane Doe',
        phone: '+998 91 234 56 78',
        attendance: 'late',
        activity: 88,
      },
      {
        id: 3,
        name: 'Bob Johnson',
        phone: '+998 93 345 67 89',
        attendance: 'present',
        activity: 92,
      },
      {
        id: 4,
        name: 'Alice Wilson',
        phone: '+998 94 456 78 90',
        attendance: 'absent',
        activity: 75,
      },
      {
        id: 5,
        name: 'Charlie Brown',
        phone: '+998 95 567 89 01',
        attendance: 'present',
        activity: 85,
      },
    ]

    // Filter students based on search query
    const filtered = mockStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.phone.includes(query)
    )

    return {
      students: filtered,
      total: filtered.length,
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching students:', error)

    throw new Error('Failed to search students: ' + (error as Error).message)
  }
}

// Add new student API
export const addStudent = async (
  student: Omit<Student, 'id'>,
  _groupId: number
): Promise<Student> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In production:
    // const response = await fetch('/api/students', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ student, groupId: _groupId })
    // })
    // return await response.json()

    // Mock response
    const newStudent: Student = {
      ...student,
      id: Date.now(),
    }

    return newStudent
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error adding student:', error)
    throw new Error('Failed to add student: ' + (error as Error).message)
  }
}

// Update student API
export const updateStudent = async (
  student: Student,
  _groupId: number
): Promise<Student> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In production:
    // const response = await fetch(`/api/students/${student.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ student, groupId: _groupId })
    // })
    // return await response.json()

    return student
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating student:', error)
    throw new Error('Failed to update student: ' + (error as Error).message)
  }
}

// Delete student API
export const deleteStudent = async (
  studentId: number,
  _groupId: number
): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In production:
    // await fetch(`/api/students/${studentId}?groupId=${_groupId}`, {
    //   method: 'DELETE'
    // })

    // eslint-disable-next-line no-console
    console.log(`Student ${studentId} deleted from group ${_groupId}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting student:', error)
    throw new Error('Failed to delete student: ' + (error as Error).message)
  }
}
