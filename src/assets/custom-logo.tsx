import type { ComponentProps } from 'react'
import favicon from './favicon.png'

export function CustomLogo(props: ComponentProps<'img'>) {
  return <img src={favicon} alt='Lingua Admin Logo' {...props} />
}
