import { useState } from 'react'
import { User } from 'lucide-react'
import type { Student } from '../index'

interface StudentModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  action: 'edit' | 'delete' | 'detail'
  onConfirm: (student: Student) => void
}

export const StudentModal = ({
  student,
  isOpen,
  onClose,
  action,
  onConfirm,
}: StudentModalProps) => {
  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    phone: student?.phone || '',
    group: student?.group || '',
  })

  // Update form when student changes for edit mode
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Reset form data when student changes
  if (student && action === 'edit' && !formData.fullName) {
    setFormData({
      fullName: student.fullName,
      phone: student.phone,
      group: student.group,
    })
  }

  if (!isOpen || !student) return null

  const handleConfirm = () => {
    if (action === 'delete') {
      // Handle delete logic
      onConfirm(student)
    } else if (action === 'edit') {
      // Handle edit logic
      const updatedStudent = { ...student, ...formData }
      onConfirm(updatedStudent)
    }
    onClose()
  }

  const renderContent = () => {
    switch (action) {
      case 'delete':
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {'\u26a0\ufe0f'}
              </div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: 8,
                }}
              >
                Delete Student
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Are you sure you want to delete "{student.fullName}" from the
                list?
              </p>
            </div>
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
              }}
            >
              <p style={{ color: '#dc2626', fontSize: 12, fontWeight: 500 }}>
                This action cannot be undone. All data will be deleted.
              </p>
            </div>
          </>
        )
      case 'edit':
        return (
          <>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 16,
              }}
            >
              Edit Student
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: 4,
                  }}
                >
                  Full Name
                </label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange('fullName', e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: 4,
                  }}
                >
                  Phone
                </label>
                <input
                  type='text'
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: 4,
                  }}
                >
                  Group
                </label>
                <select
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value='Beginner'>Beginner</option>
                  <option value='Intermediate'>Intermediate</option>
                  <option value='Advanced'>Advanced</option>
                </select>
              </div>
            </div>
          </>
        )
      case 'detail':
        return (
          <>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 16,
              }}
            >
              Student Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <User size={24} color='#64748b' />
                </div>
                <div>
                  <div
                    style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}
                  >
                    {student.fullName}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      display: 'inline-block',
                      background: '#f1f5f9',
                      color: '#475569',
                      marginTop: 4,
                    }}
                  >
                    {student.group}
                  </div>
                </div>
              </div>
              <div
                style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
                      PHONE
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {student.phone}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
                      PAYMENT STATUS
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {student.paymentStatus === 'paid' && 'Paid'}
                      {student.paymentStatus === 'pending' && 'Pending'}
                      {student.paymentStatus === 'overdue' && 'Overdue'}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
                      STATUS
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
                      GROUP
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {student.group}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--bg-primary, #fff)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 480,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        {renderContent()}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            marginTop: 24,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border-color, #d1d5db)',
              borderRadius: 8,
              background: 'var(--bg-primary, #fff)',
              color: 'var(--text-color, #6b7280)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {action === 'detail' ? 'Close' : 'Cancel'}
          </button>
          {action !== 'detail' && (
            <button
              onClick={handleConfirm}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                background:
                  action === 'delete'
                    ? 'var(--error-color, #dc2626)'
                    : 'var(--primary-color, #e11d48)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {action === 'delete' ? 'Delete' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
