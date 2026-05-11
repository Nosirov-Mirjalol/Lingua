export type AccessEntry =
  | string
  | {
      code?: string | null
      name?: string | null
    }

export function hasAccessCode(
  entries: AccessEntry[] | undefined,
  target: string
): boolean {
  if (!target) return false

  return (entries ?? []).some((entry) => {
    if (typeof entry === 'string') {
      return entry === target
    }

    return entry?.code === target || entry?.name === target
  })
}
