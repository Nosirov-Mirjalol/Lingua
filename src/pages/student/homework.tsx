import { Bell, MessageSquare, LayoutDashboard, BookOpen, CreditCard, Settings, User, FileText, UploadCloud, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function HomeworkDashboard() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#1a1a2e] p-6 flex flex-col justify-between border-r border-[#2d2d44]">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#e84855] rounded-lg" />
            <h1 className="text-xl font-bold">LinguaPro</h1>
          </div>
          <nav className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer"><LayoutDashboard size={20} /> Dashboard</div>
            <div className="flex items-center gap-3 text-[#e84855] font-semibold border-l-2 border-[#e84855] pl-4"><BookOpen size={20} /> Homework</div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer"><MessageSquare size={20} /> Messages</div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer"><CreditCard size={20} /> Payments</div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer"><Settings size={20} /> Settings</div>
          </nav>
        </div>
        <div className="bg-[#2a2a4a] p-4 rounded-xl text-center">
          <h4 className="font-bold mb-2">Upgrade to Pro</h4>
          <Button className="w-full bg-[#e84855] hover:bg-[#d43a47]">Get Pro Plan</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="h-16 border-b border-[#2d2d44] flex items-center justify-between px-8">
          <div className="flex gap-6 text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer">Dashboard</span>
            <span className="text-white border-b-2 border-[#e84855] pb-1 cursor-pointer">Homework</span>
            <span className="hover:text-white cursor-pointer">Messages</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400" />
            <MessageSquare size={20} className="text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-600" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex flex-1 p-8 gap-8">
          {/* Assignment Hub */}
          <section className="w-1/3 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">Vazifalar <span className="text-sm font-normal text-gray-400">(Filter)</span></h2>
            <Card className="bg-[#1a1a2e] border-none text-white rounded-xl">
              <CardContent className="p-4 space-y-4">
                <AssignmentCard status="pending" title="Advanced Essay" time="4h 12m" />
                <AssignmentCard status="completed" title="Grammar Quiz" score="94/100" />
                <AssignmentCard status="overdue" title="Unit 11 Review" time="Late 2d" />
              </CardContent>
            </Card>
            <div className="bg-[#1a1a2e] p-6 rounded-xl">
              <h3 className="mb-2">88% Completion</h3>
              <Progress value={88} className="h-2 bg-gray-700" />
            </div>
          </section>

          {/* Task Detail View */}
          <section className="flex-1 bg-[#1a1a2e] p-8 rounded-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">UNIT 12 • WRITING WORKSHOP</p>
                <h1 className="text-3xl font-bold mb-4">Advanced Essay: The Future of AI in Linguistics</h1>
              </div>
              <div className="flex items-center gap-2 bg-[#2a2a4a] p-3 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gray-500" />
                <div>
                  <p className="text-sm font-bold">Dr. Sarah Smith</p>
                  <p className="text-xs text-gray-400">Linguistics Dept</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed">Task description goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            <div className="bg-[#0f0f1a] p-6 rounded-xl mb-8 border border-[#2d2d44]">
              <h4 className="font-bold mb-4">Submission Requirements</h4>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-10 flex flex-col items-center text-gray-400">
                <UploadCloud size={40} className="mb-2" />
                <p>Drag and drop your file here</p>
              </div>
            </div>
            <Button className="w-full bg-[#e84855] text-lg h-12 hover:bg-[#d43a47]">Submit Homework</Button>
          </section>
        </div>
      </main>
    </div>
  )
}

function AssignmentCard({ status, title, time, score }: { status: string, title: string, time?: string, score?: string }) {
  const badgeColors = {
    pending: 'bg-[#e84855]/20 text-[#e84855]',
    completed: 'bg-[#2ecc71]/20 text-[#2ecc71]',
    overdue: 'bg-orange-500/20 text-orange-500',
  }
  return (
    <div className="bg-[#0f0f1a] p-4 rounded-xl flex justify-between items-center">
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-xs text-gray-400">Unit 12 • Dr. Sarah</p>
      </div>
      <Badge className={badgeColors[status as keyof typeof badgeColors]}>{score || time}</Badge>
    </div>
  )
}
