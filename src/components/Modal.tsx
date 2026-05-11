import { useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalProps) => {
  if (!isOpen) return null

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
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
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
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>{children}</div>

        {footer && (
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface AvatarUploadProps {
  onImageChange: (imageUrl: string) => void
  currentImage?: string
}

export const AvatarUpload = ({
  onImageChange,
  currentImage,
}: AvatarUploadProps) => {
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
        gap: 12,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: currentImage ? 'transparent' : '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px dashed ${dragActive ? '#e11d48' : '#cbd5e1'}`,
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
              borderRadius: '50%',
            }}
          />
        ) : (
          <svg
            width={32}
            height={32}
            viewBox='0 0 24 24'
            fill='none'
            stroke='#94a3b8'
            strokeWidth={2}
          >
            <path d='M12 2v20M2 12h20' />
          </svg>
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
          Rasmni yuklash
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          PNG, JPG (max. 2MB)
        </div>
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

interface FormFieldProps {
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number'
  value?: string
  onChange?: (value: string) => void
  required?: boolean
}

export const FormField = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  required = false,
}: FormFieldProps) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 500,
          color: '#374151',
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: '#e11d48', marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#e11d48'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db'
        }}
      />
    </div>
  )
}

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
  type?: 'button' | 'submit'
}

export const Button = ({
  variant = 'primary',
  onClick,
  children,
  type = 'button',
}: ButtonProps) => {
  const styles = {
    primary: {
      background: '#e11d48',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: '#fff',
      color: '#6b7280',
      border: '1px solid #d1d5db',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: '12px 24px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...styles[variant],
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = '#be123c'
        } else {
          e.currentTarget.style.background = '#f9fafb'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = '#e11d48'
        } else {
          e.currentTarget.style.background = '#fff'
        }
      }}
    >
      {children}
    </button>
  )
}
