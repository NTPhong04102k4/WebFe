import { Modal } from '@/components/core/Modal/Modal'
import type { CarResponseItem } from '@/shared/types/Reponse/Car'

type Props = {
  car: CarResponseItem | null
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function CarDeleteModal({ car, isDeleting, onConfirm, onClose }: Props) {
  return (
    <Modal
      open={car !== null}
      title="Xác nhận xóa xe"
      size="sm"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={isDeleting}
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa xe'}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        Bạn có chắc muốn xóa{' '}
        <span className="font-semibold text-slate-900">{car?.carName}</span>?
        Hành động này không thể hoàn tác.
      </p>
    </Modal>
  )
}
