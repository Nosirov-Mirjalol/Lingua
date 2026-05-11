export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
export const PASSWORD_REGEX = /^[^\s]{7,32}$/
export const PHONE_DIGITS_REGEX = /^\d{9}$/

export function sanitizeUsername(value: string) {
  return value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)
}

export function sanitizePassword(value: string) {
  return value.replace(/\s/g, '').slice(0, 32)
}

export function sanitizePhoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 9)
}

export function formatPhoneDigits(value: string) {
  const digits = sanitizePhoneDigits(value)
  const part1 = digits.slice(0, 2)
  const part2 = digits.slice(2, 5)
  const part3 = digits.slice(5, 7)
  const part4 = digits.slice(7, 9)

  let result = ''

  if (part1) result += part1
  if (part2) result += `-${part2}`
  if (part3) result += `-${part3}`
  if (part4) result += `-${part4}`

  return result
}
