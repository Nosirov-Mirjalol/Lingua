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
    <div className={muted ? 'rounded-3xl border border-primary/20 bg-muted/50 p-4 transition-all hover:border-primary/30 hover:shadow-md' : 'rounded-3xl border border-primary/20 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md'}>
      <p className='text-sm text-muted-foreground'>{title}</p>
      <p className='mt-2 text-base font-semibold text-foreground'>{value}</p>
    </div>
  )
}
