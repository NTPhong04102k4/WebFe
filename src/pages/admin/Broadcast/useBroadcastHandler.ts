import { useState } from "react";

import { useBroadcastList, useBroadcastMutations } from "src/query/broadcast/useBroadcastQueries";
import { notify } from "src/components/core/Feedback/toast";
import type { BroadcastViewModel } from "src/shared/types/Reponse/Broadcast";
import type { BroadcastQueryRequest, BroadcastRequest } from "src/shared/types/Request/Broadcast";

const PAGE_SIZE = 20;

export type ModalState = { mode: "create" | "edit"; item?: BroadcastViewModel } | null;

export type BroadcastHandlerReturn = {
  list: BroadcastViewModel[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  page: number;
  statusFilter: string;
  modal: ModalState;
  confirmDelete: number | null;
  confirmSend: number | null;
  mutationLoading: boolean;
  isPendingDelete: boolean;
  isPendingSend: boolean;
  openCreateModal: () => void;
  openEditModal: (item: BroadcastViewModel) => void;
  closeModal: () => void;
  openConfirmDelete: (id: number) => void;
  closeConfirmDelete: () => void;
  openConfirmSend: (id: number) => void;
  closeConfirmSend: () => void;
  handleStatusFilterChange: (value: string) => void;
  handlePagePrev: () => void;
  handlePageNext: () => void;
  handleSubmit: (values: BroadcastRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleSendNow: () => Promise<void>;
  refetch: () => void;
};

export function useBroadcastHandler(): BroadcastHandlerReturn {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmSend, setConfirmSend] = useState<number | null>(null);

  const query: BroadcastQueryRequest = { page, pageSize: PAGE_SIZE, status: statusFilter || undefined };
  const { data, isLoading, refetch } = useBroadcastList(query);
  const { create, update, remove, sendNow } = useBroadcastMutations();

  const list = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSubmit = async (values: BroadcastRequest) => {
    try {
      if (modal?.mode === "edit" && modal.item) {
        await update.mutateAsync({ id: modal.item.broadcastID, data: values });
        notify.success("Đã cập nhật broadcast");
      } else {
        await create.mutateAsync(values);
        notify.success("Đã tạo broadcast");
      }
      setModal(null);
    } catch {
      // interceptor already shows error toast
    }
  };

  const handleDelete = async () => {
    if (confirmDelete == null) return;
    try {
      await remove.mutateAsync(confirmDelete);
      notify.success("Đã xoá broadcast");
    } catch {
      // interceptor handles
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSendNow = async () => {
    if (confirmSend == null) return;
    try {
      const res = await sendNow.mutateAsync(confirmSend);
      notify.success(res.message ?? "Đã gửi thành công");
    } catch {
      // interceptor handles
    } finally {
      setConfirmSend(null);
    }
  };

  return {
    list,
    total,
    totalPages,
    isLoading,
    page,
    statusFilter,
    modal,
    confirmDelete,
    confirmSend,
    mutationLoading: create.isPending || update.isPending,
    isPendingDelete: remove.isPending,
    isPendingSend: sendNow.isPending,
    openCreateModal: () => setModal({ mode: "create" }),
    openEditModal: (item) => setModal({ mode: "edit", item }),
    closeModal: () => setModal(null),
    openConfirmDelete: (id) => setConfirmDelete(id),
    closeConfirmDelete: () => setConfirmDelete(null),
    openConfirmSend: (id) => setConfirmSend(id),
    closeConfirmSend: () => setConfirmSend(null),
    handleStatusFilterChange,
    handlePagePrev: () => setPage((p) => Math.max(1, p - 1)),
    handlePageNext: () => setPage((p) => Math.min(totalPages, p + 1)),
    handleSubmit,
    handleDelete,
    handleSendNow,
    refetch,
  };
}
