import { useState } from 'react'

interface Teacher {
  id: number
  name: string
  initials: string
  subject: string
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
  email?: string
  level?: string
  avatar?: string
}

interface TeacherModalProps {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  action: 'edit' | 'delete' | 'detail'
  onConfirm: (teacher: Teacher) => void
}

// ─── Shared close button ────────────────────────────────────────────────────
const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }}
    style={{
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 8,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      fontSize: 20,
      lineHeight: 1,
      transition: 'all 0.2s',
      zIndex: 1001,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#f3f4f6'
      e.currentTarget.style.color = '#374151'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = '#6b7280'
    }}
  >
    ×
  </button>
)

// ─── Shared overlay wrapper ─────────────────────────────────────────────────
const Overlay = ({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={(e) => {
      e.stopPropagation()
      onClose()
    }}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        maxWidth: 480,
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        position: 'relative',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
)

// ─── Shared Button ──────────────────────────────────────────────────────────
const Btn = ({
  onClick,
  variant = 'primary',
  children,
}: {
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
}) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: '#e11d48',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: '#f8fafc',
      color: '#475569',
      border: '1px solid #e2e8f0',
    },
    danger: {
      background: '#dc2626',
      color: '#fff',
      border: 'none',
    },
  }
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        ...styles[variant],
        padding: '10px 20px',
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
  )
}

// ─── AvatarUpload ──────────────────────────────────────────────────────────
const AvatarUpload = ({
  onImageChange,
  currentImage,
}: {
  onImageChange: (imageUrl: string) => void
  currentImage?: string
}) => {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      onImageChange(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          background: currentImage ? 'transparent' : '#fff1f2',
          border: `2px dashed ${dragActive ? '#e11d48' : '#fda4af'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.getElementById(
            'avatar-upload'
          ) as HTMLInputElement
          if (input) input.click()
        }}
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt='Avatar'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 10,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <svg viewBox='0 0 40 40' fill='none' width={36} height={36}>
              <circle cx='20' cy='15' r='8' fill='#fb7185' />
              <ellipse cx='20' cy='33' rx='12' ry='7' fill='#fb7185' />
            </svg>
          </div>
        )}
      </div>
      <input
        id='avatar-upload'
        type='file'
        accept='image/*'
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

// ─── FormField ──────────────────────────────────────────────────────────────
const FormField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  options,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  options?: string[]
}) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 500,
        color: '#374151',
        marginBottom: 4,
      }}
    >
      {label}
      {required && <span style={{ color: '#e11d48', marginLeft: 2 }}>*</span>}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 14,
          color: '#1e293b',
        }}
      >
        <option value=''>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 14,
          color: '#1e293b',
        }}
      />
    )}
  </div>
)

// ─── Main Component ─────────────────────────────────────────────────────────
export const TeacherModal = ({
  teacher,
  isOpen,
  onClose,
  action,
  onConfirm,
}: TeacherModalProps) => {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    level: teacher?.level || '',
    experience: teacher?.experience?.toString() || '',
    avatar: teacher?.avatar || '',
  })

  if (!isOpen) return null

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, avatar: imageUrl }))
  }

  const handleConfirm = () => {
    if (action === 'delete') {
      if (teacher) onConfirm(teacher)
    } else if (action === 'edit') {
      const updatedTeacher: Teacher = {
        id: teacher?.id || 0,
        name: formData.name,
        initials: formData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        subject: teacher?.subject || formData.level,
        phone: formData.phone,
        email: formData.email,
        level: formData.level,
        experience: parseInt(formData.experience) || 0,
        avatar: formData.avatar,
        badgeColor: teacher?.badgeColor || {
          bg: '#fff1f2',
          text: '#e11d48',
          border: '#fda4af',
          avatarBg: '#fff1f2',
          avatarFill: '#fb7185',
        },
        groups: teacher?.groups || 0,
        rating: teacher?.rating || 0,
      }
      onConfirm(updatedTeacher)
    }
    onClose()
  }

  // ── DELETE ──────────────────────────────────────────────────────────────
  if (action === 'delete') {
    return (
      <Overlay onClose={onClose}>
        <CloseButton onClose={onClose} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            Delete Teacher
          </h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Are you sure you want to delete "{teacher?.name}" from the list?
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
            Bu amal ortga qaytarib bo'lmaydi. Barcha ma'lumotlar o'chiriladi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Btn variant='secondary' onClick={onClose}>
            Bekor qilish
          </Btn>
          <Btn variant='danger' onClick={handleConfirm}>
            O'chirish
          </Btn>
        </div>
      </Overlay>
    )
  }

  // ── DETAIL ──────────────────────────────────────────────────────────────
  if (action === 'detail') {
    return (
      <Overlay onClose={onClose}>
        <CloseButton onClose={onClose} />

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: 16,
          }}
        >
          Teacher Information
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#fff1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox='0 0 40 40' fill='none' width={28} height={28}>
                <circle cx='20' cy='15' r='8' fill='#fb7185' />
                <ellipse cx='20' cy='33' rx='12' ry='7' fill='#fb7185' />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                {teacher?.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  display: 'inline-block',
                  background: '#fff1f2',
                  color: '#e11d48',
                  marginTop: 4,
                }}
              >
                {teacher?.subject}
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              {[
                { label: 'TELEFON', value: teacher?.phone },
                { label: 'REYTING', value: `${teacher?.rating ?? 0} / 5.0` },
                { label: 'GURUHLAR', value: `${teacher?.groups ?? 0} ta` },
                { label: 'TAJRIBA', value: `${teacher?.experience ?? 0} yil` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div
                    style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}
                  >
                    {label}
                  </div>
                  <div
                    style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}
        >
          <Btn variant='secondary' onClick={onClose}>
            Yopish
          </Btn>
        </div>
      </Overlay>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '40px 32px',
          maxWidth: 520,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: 20,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.color = '#374151'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6b7280'
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            Add Teacher
          </h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Fill in the new teacher information
          </p>
        </div>

        <AvatarUpload
          onImageChange={handleAvatarChange}
          currentImage={formData.avatar}
        />

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <div>
            <FormField
              label='Full Name (F.I.SH)'
              placeholder='e.g. Alisher Navoiy'
              value={formData.name}
              onChange={(v) => handleInputChange('name', v)}
              required
            />
          </div>
          <div>
            <FormField
              label='Phone Number'
              type='tel'
              placeholder='+998 90 123 45 67'
              value={formData.phone}
              onChange={(v) => handleInputChange('phone', v)}
              required
            />
          </div>
          <div>
            <FormField
              label='Email Address'
              type='email'
              placeholder='example@linguapro.uz'
              value={formData.email}
              onChange={(v) => handleInputChange('email', v)}
              required
            />
          </div>
          <div>
            <FormField
              label='Teacher Level'
              placeholder='Select level'
              value={formData.level}
              onChange={(v) => handleInputChange('level', v)}
              required
              options={[
                'IELTS Expert',
                'Grammar Specialist',
                'English for Kids',
                'Business English',
                'Russian Expert',
                'Speaking Coach',
                'Writing Specialist',
                'TOEFL Expert',
                'General English',
              ]}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <FormField
            label='Experience (years)'
            type='number'
            placeholder='Enter years'
            value={formData.experience}
            onChange={(v) => handleInputChange('experience', v)}
            required
          />
        </div>

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
              padding: '12px 24px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              background: '#fff',
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              background: '#e11d48',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
