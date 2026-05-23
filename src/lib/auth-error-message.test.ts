import { describe, expect, it } from 'vitest'
import { getAuthErrorMessage } from './auth-error-message'

describe('getAuthErrorMessage', () => {
  it('maps unknown user errors to Uzbek', () => {
    const msg = getAuthErrorMessage(
      {
        status: 400,
        message: "CustomUser matching query does not exist.",
        success: false,
      },
      'fallback'
    )
    expect(msg).toContain('topilmadi')
  })

  it('maps 500 to server message', () => {
    const msg = getAuthErrorMessage(
      { status: 500, message: 'Internal', success: false },
      'fallback'
    )
    expect(msg).toContain('Server')
  })
})
