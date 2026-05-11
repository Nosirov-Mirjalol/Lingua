import { useState } from 'react'
import { Smile, Paperclip, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  return (
    <div className='p-4 border-t border-border flex items-center bg-background'>
      <Button variant='ghost' size='icon' className='mr-2'>
        <Smile size={20} />
      </Button>
      <Button variant='ghost' size='icon' className='mr-2'>
        <Paperclip size={20} />
      </Button>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Xabar yozing...'
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        className='flex-1 rounded-full'
      />
      <Button variant='ghost' size='icon' className='ml-2 text-primary' onClick={handleSend}>
        <Send size={20} />
      </Button>
    </div>
  )
}
