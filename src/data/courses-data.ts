export interface Course {
  title: string
  level: string
  duration: string
  groups: string
  price: string
  image: string
  isBestseller?: boolean
  color: string
  category: 'english' | 'russian' | 'other'
}

export const coursesData: Course[] = [
  {
    title: 'IELTS General Prep',
    level: 'C1 Advanced',
    duration: '3 oy',
    groups: '12 ta faol',
    price: '850,000 UZS / oy',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop',
    isBestseller: true,
    color: '#0f172a',
    category: 'english',
  },
  {
    title: 'General English',
    level: 'A2-B1 Intermediate',
    duration: '6 oy',
    groups: '24 ta faol',
    price: '450,000 UZS / oy',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    color: '#e11d48',
    category: 'english',
  },
  {
    title: 'Business Russian',
    level: 'B2 Upper-Int',
    duration: '4 oy',
    groups: '5 ta faol',
    price: '600,000 UZS / oy',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
    color: '#1e293b',
    category: 'russian',
  },
  {
    title: 'Kids English Star',
    level: 'A1 Beginner',
    duration: '12 oy',
    groups: '18 ta faol',
    price: '380,000 UZS / oy',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop',
    color: '#64748b',
    category: 'english',
  },
]
