export function StudentRouteFallback() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <div className='h-4 w-28 rounded-full bg-muted' />
        <div className='h-10 w-64 rounded-2xl bg-muted' />
      </div>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='h-36 animate-pulse rounded-3xl border bg-card/70'
          />
        ))}
      </div>
    </div>
  )
}
