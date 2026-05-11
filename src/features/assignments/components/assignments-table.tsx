import React from 'react'
import { Edit, Trash2, Calendar, Users } from 'lucide-react'
import type { Assignment } from '@/api/service/teacher/assignment.type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AssignmentsTableProps {
  assignments: Assignment[]
  onEdit: (assignment: Assignment) => void
  onDelete: (id: number) => void
}

export function AssignmentsTable({
  assignments,
  onEdit,
  onDelete,
}: AssignmentsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments?.length > 0 ? (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className='font-medium'>
                    {assignment.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center text-sm text-gray-500'>
                      <Calendar className='mr-2 h-4 w-4' />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-lg font-bold text-[#e11d48]'>
                      {assignment.grade || 'Not graded'} / {assignment.maxGrade}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center text-sm text-gray-500'>
                      <Users className='mr-2 h-4 w-4' />
                      {assignment.groupName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onEdit(assignment)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => onDelete(assignment.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className='py-8 text-center'>
                  <div className='text-gray-500'>No assignments found</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
