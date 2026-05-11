import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface ThemeSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'system' | 'light' | 'dark'
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void
}

export function ThemeSettingsModal({ isOpen, onClose, theme, onThemeChange }: ThemeSettingsModalProps) {
  const [sidebar, setSidebar] = useState('inset')
  const [layout, setLayout] = useState('default')
  const [direction, setDirection] = useState('ltr')

  const handleReset = () => {
    onThemeChange('system')
    setSidebar('inset')
    setLayout('default')
    setDirection('ltr')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Theme Settings</h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Theme Section */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={onThemeChange}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sidebar Section */}
          <div>
            <Label className="text-base font-medium">Sidebar</Label>
            <RadioGroup
              value={sidebar}
              onValueChange={setSidebar}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inset" id="inset" />
                <Label htmlFor="inset">Inset</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="floating" id="floating" />
                <Label htmlFor="floating">Floating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sidebar" id="sidebar" />
                <Label htmlFor="sidebar">Sidebar</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Layout Section */}
          <div>
            <Label className="text-base font-medium">Layout</Label>
            <RadioGroup
              value={layout}
              onValueChange={setLayout}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="compact" />
                <Label htmlFor="compact">Compact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full">Full layout</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Direction Section */}
          <div>
            <Label className="text-base font-medium">Direction</Label>
            <RadioGroup
              value={direction}
              onValueChange={setDirection}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ltr" id="ltr" />
                <Label htmlFor="ltr">Left to Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rtl" id="rtl" />
                <Label htmlFor="rtl">Right to Left</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
