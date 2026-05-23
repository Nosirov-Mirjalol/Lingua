import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

const mutateAsyncMock = vi.fn()

vi.mock('@/hooks/auth/useForgotPassword', () => ({
  useForgotPassword: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let usernameInput: Locator
  let phoneInput: Locator
  let continueButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    mutateAsyncMock.mockResolvedValue(undefined)

    screen = await render(<ForgotPasswordForm />)
    usernameInput = screen.getByRole('textbox', {
      name: /^Foydalanuvchi nomi$/i,
    })
    phoneInput = screen.getByRole('textbox', { name: /^Telefon raqami$/i })
    continueButton = screen.getByRole('button', { name: /^Davom etish$/i })
  })

  it('renders username, phone, and continue button', async () => {
    await expect.element(usernameInput).toBeInTheDocument()
    await expect.element(phoneInput).toBeInTheDocument()
    await expect.element(continueButton).toBeInTheDocument()
  })

  it('shows validation when submitting empty form', async () => {
    await userEvent.clear(phoneInput)
    await userEvent.click(continueButton)

    await expect
      .element(screen.getByText(/^Foydalanuvchi nomini kiriting$/i))
      .toBeInTheDocument()
    await expect
      .element(
        screen.getByText(
          /^Telefon raqamida \+998 dan keyin 9 ta son bo'lsin$/i
        )
      )
      .toBeInTheDocument()
  })

  it('calls forgot-password API on valid submit', async () => {
    await userEvent.fill(usernameInput, 'testuser')
    await userEvent.clear(phoneInput)
    await userEvent.fill(phoneInput, '+998 90-123-45-67')
    await userEvent.click(continueButton)

    await vi.waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        username: 'testuser',
        phone: '901234567',
      })
    )
  })
})
