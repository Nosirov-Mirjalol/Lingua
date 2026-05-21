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
    <div className={muted ? 'rounded-3xl border border-primary/40 bg-muted/50 p-4 transition-all hover:border-primary/60 hover:shadow-md' : 'rounded-3xl border border-primary/40 bg-card p-4 transition-all hover:border-primary/60 hover:shadow-md'}>
      <p className='text-sm text-muted-foreground'>{title}</p>
      <p className='mt-2 text-base font-semibold text-foreground'>{value}</p>
    </div>
  )
}
