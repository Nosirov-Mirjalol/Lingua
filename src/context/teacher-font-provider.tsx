import { createContext, useContext, useEffect, useState } from 'react'
import { fonts } from '@/config/fonts'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

type Font = (typeof fonts)[number]

const TEACHER_FONT_COOKIE_NAME = 'teacher-font'
const FONT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type TeacherFontContextType = {
  font: Font
  setFont: (font: Font) => void
  resetFont: () => void
}

const TeacherFontContext = createContext<TeacherFontContextType | null>(null)

export function TeacherFontProvider({ children }: { children: React.ReactNode }) {
  const [font, _setFont] = useState<Font>(() => {
    const savedFont = getCookie(TEACHER_FONT_COOKIE_NAME)
    return fonts.includes(savedFont as Font) ? (savedFont as Font) : fonts[0]
  })

  useEffect(() => {
    const applyFont = (font: string) => {
      const root = document.documentElement
      root.classList.forEach((cls) => {
        if (cls.startsWith('font-')) root.classList.remove(cls)
      })
      root.classList.add(`font-${font}`)
    }

    applyFont(font)
  }, [font])

  const setFont = (font: Font) => {
    setCookie(TEACHER_FONT_COOKIE_NAME, font, FONT_COOKIE_MAX_AGE)
    _setFont(font)
  }

  const resetFont = () => {
    removeCookie(TEACHER_FONT_COOKIE_NAME)
    _setFont(fonts[0])
  }

  return (
    <TeacherFontContext value={{ font, setFont, resetFont }}>{children}</TeacherFontContext>
  )
}

export const useTeacherFont = () => {
  const context = useContext(TeacherFontContext)
  if (!context) {
    throw new Error('useTeacherFont must be used within a TeacherFontProvider')
  }
  return context
}
