/** Bazadagi format: +998 siz, 9 ta raqam (masalan 901234567). */
export function normalizePhoneForApi(value: string): string {
  const digits = value
    .trim()
    .replace(/\s/g, '')
    .replace(/^\+?998/, '')
    .replace(/\D/g, '')
  return digits.slice(0, 9)
}
