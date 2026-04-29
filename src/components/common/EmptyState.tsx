import { Inbox } from 'lucide-react'

interface Props {
  title?: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({
  title = 'Không có dữ liệu',
  description = 'Chưa có mục nào để hiển thị.',
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="mb-4 h-12 w-12 text-slate-300" />
      <h3 className="mb-1 text-lg font-medium text-slate-700">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      {action}
    </div>
  )
}
