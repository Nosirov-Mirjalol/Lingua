type StudentInfoTileProps = {
  title: string
  value: string
  muted?: boolean
}

export function StudentInfoTile({
  title,
  value,
  muted = false,
}: StudentInfoTileProps) {
  return (
    <div className={muted ? 'rounded-3xl border bg-muted/50 p-4' : 'rounded-3xl border bg-card p-4'}>
      <p className='text-sm text-muted-foreground'>{title}</p>
      <p className='mt-2 text-base font-semibold text-foreground'>{value}</p>
    </div>
  )
}
