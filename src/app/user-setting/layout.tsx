import { Sidebar } from '@/components/Sidebar'

export default function UserSettingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-auto bg-gray-50">
        {children}
      </div>
    </div>
  )
}
