import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import { DataTable, Input, Modal } from "@/components/common";
import { useServiceCategoryList } from "src/query/service-category/useServiceCategoryQueries";
import {
  useServiceCatalog,
  useServiceCatalogMutations,
} from "src/query/service-catalog/useServiceCatalogQueries";
import type {
  ServiceCatalogQuery,
  ServiceCatalogRequest,
  ServiceCatalogViewModel,
} from "src/services/api/functions/serviceCatalog/serviceCatalog.types";
import { notify } from "src/components/core/Feedback/toast";

import {
  ActionButton,
  Badge,
  formatDate,
  formatMoney,
  getErrorMessage,
  PageHeader,
} from "../workshopUi";

type ServiceForm = {
  serviceCode: string;
  serviceName: string;
  categoryID: string;
  description: string;
  price: string;
  estimatedDuration_minutes: string;
  requiredSkills: string;
  isActive: boolean;
};

const defaults: ServiceForm = {
  serviceCode: "",
  serviceName: "",
  categoryID: "",
  description: "",
  price: "0",
  estimatedDuration_minutes: "60",
  requiredSkills: "",
  isActive: true,
};

function requiredSkillsToText(value?: string[] | null) {
  return value?.join(", ") ?? "";
}

function textToRequiredSkills(value: string) {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export default function ServiceCatalogPage() {
  const [query, setQuery] = useState<ServiceCatalogQuery>({
    page: 1,
    pageSize: 20,
    isActive: true,
  });
  const [draft, setDraft] = useState({
    keyword: "",
    categoryID: "",
    isActive: "true",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCatalogViewModel | null>(null);

  const { data, isLoading } = useServiceCatalog(query);
  const { data: categories = [] } = useServiceCategoryList();
  const mutations = useServiceCatalogMutations();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceForm>({
    defaultValues: defaults,
  });

  const openCreate = () => {
    setEditing(null);
    reset(defaults);
    setFormOpen(true);
  };

  const openEdit = (service: ServiceCatalogViewModel) => {
    setEditing(service);
    reset({
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      categoryID: String(service.categoryID),
      description: service.description ?? "",
      price: String(service.price),
      estimatedDuration_minutes: String(service.estimatedDuration_minutes),
      requiredSkills: requiredSkillsToText(service.requiredSkills),
      isActive: service.isActive,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
    reset(defaults);
  };

  const applyFilter = () => {
    setQuery({
      page: 1,
      pageSize: 20,
      keyword: draft.keyword || undefined,
      categoryID: draft.categoryID ? Number(draft.categoryID) : undefined,
      isActive: draft.isActive === "" ? undefined : draft.isActive === "true",
    });
  };

  const saveService = async (values: ServiceForm) => {
    const body: ServiceCatalogRequest = {
      serviceCode: values.serviceCode.trim(),
      serviceName: values.serviceName.trim(),
      categoryID: Number(values.categoryID),
      description: values.description.trim() || null,
      price: Number(values.price || 0),
      estimatedDuration_minutes: Number(values.estimatedDuration_minutes || 0),
      requiredSkills: textToRequiredSkills(values.requiredSkills),
      isActive: values.isActive,
    };

    try {
      if (editing) {
        await mutations.updateService.mutateAsync({ id: editing.serviceID, body });
        notify.success("Da cap nhat dich vu");
      } else {
        await mutations.createService.mutateAsync(body);
        notify.success("Da tao dich vu");
      }
      closeForm();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const toggleStatus = async (service: ServiceCatalogViewModel) => {
    try {
      await mutations.patchServiceStatus.mutateAsync({
        id: service.serviceID,
        body: { isActive: !service.isActive },
      });
      notify.success("Da cap nhat trang thai");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const deleteService = async (service: ServiceCatalogViewModel) => {
    if (!window.confirm(`Xoa mem dich vu ${service.serviceName}?`)) return;
    try {
      await mutations.deleteService.mutateAsync(service.serviceID);
      notify.success("Da xoa dich vu");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const columns = useMemo<ColumnDef<ServiceCatalogViewModel>[]>(
    () => [
      {
        header: "Dich vu",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.serviceName}</div>
            <div className="text-xs text-slate-500">{row.original.serviceCode}</div>
          </div>
        ),
      },
      {
        header: "Danh muc",
        cell: ({ row }) => row.original.categoryName ?? row.original.categoryID,
      },
      {
        header: "Gia",
        cell: ({ row }) => formatMoney(row.original.price),
      },
      {
        header: "Thoi luong",
        cell: ({ row }) => `${row.original.estimatedDuration_minutes} phut`,
      },
      {
        header: "Trang thai",
        cell: ({ row }) => (
          <Badge tone={row.original.isActive ? "green" : "slate"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Ngay tao",
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        header: "Thao tac",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => openEdit(row.original)}>Sua</ActionButton>
            <ActionButton onClick={() => toggleStatus(row.original)}>
              {row.original.isActive ? "Tat" : "Bat"}
            </ActionButton>
            <ActionButton variant="danger" onClick={() => deleteService(row.original)}>Xoa</ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / (query.pageSize ?? 20)));

  return (
    <div>
      <PageHeader
        title="Danh muc dich vu"
        description="Quan ly core.services de appointment va work order co danh sach dich vu chinh thuc."
        action={<ActionButton variant="primary" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Them dich vu</ActionButton>}
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-4">
        <Input label="Tu khoa" value={draft.keyword} onChange={(e) => setDraft((s) => ({ ...s, keyword: e.target.value }))} placeholder="Ten hoac ma dich vu" />
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Danh muc</span>
          <select value={draft.categoryID} onChange={(e) => setDraft((s) => ({ ...s, categoryID: e.target.value }))} className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900">
            <option value="">Tat ca</option>
            {categories.map((category) => (
              <option key={category.categoryID} value={category.categoryID}>{category.categoryName}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Trang thai</span>
          <select value={draft.isActive} onChange={(e) => setDraft((s) => ({ ...s, isActive: e.target.value }))} className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900">
            <option value="">Tat ca</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <ActionButton variant="primary" onClick={applyFilter}><Search className="mr-2 h-4 w-4" /> Loc</ActionButton>
          <ActionButton onClick={() => {
            setDraft({ keyword: "", categoryID: "", isActive: "true" });
            setQuery({ page: 1, pageSize: 20, isActive: true });
          }}>Xoa</ActionButton>
        </div>
      </div>

      <DataTable data={rows} columns={columns} getRowId={(row) => String(row.serviceID)} loading={isLoading} emptyTitle="Chua co dich vu" enablePagination={false} />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tong {data?.totalCount ?? 0} dich vu</span>
        <div className="flex gap-2">
          <ActionButton disabled={(query.page ?? 1) <= 1} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>Truoc</ActionButton>
          <span className="px-2 py-2">Trang {query.page ?? 1}/{totalPages}</span>
          <ActionButton disabled={(query.page ?? 1) >= totalPages} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>Sau</ActionButton>
        </div>
      </div>

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Sua dich vu" : "Them dich vu"} size="xl" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={closeForm}>Huy</ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit(saveService)} disabled={mutations.createService.isPending || mutations.updateService.isPending}>Luu</ActionButton>
        </div>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Ma dich vu" maxLength={20} required {...register("serviceCode", { required: "Bat buoc", maxLength: 20 })} error={errors.serviceCode?.message} />
          <Input label="Ten dich vu" maxLength={200} required {...register("serviceName", { required: "Bat buoc", maxLength: 200 })} error={errors.serviceName?.message} />
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Danh muc *</span>
            <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("categoryID", { required: "Bat buoc" })}>
              <option value="">Chon danh muc</option>
              {categories.map((category) => (
                <option key={category.categoryID} value={category.categoryID}>{category.categoryName}</option>
              ))}
            </select>
            {errors.categoryID?.message ? <p className="text-xs text-red-600">{errors.categoryID.message}</p> : null}
          </label>
          <Input label="Gia" type="number" min={0} required {...register("price", { required: "Bat buoc" })} error={errors.price?.message} />
          <Input label="Thoi luong phut" type="number" min={1} required {...register("estimatedDuration_minutes", { required: "Bat buoc" })} error={errors.estimatedDuration_minutes?.message} />
          <Input label="Required skills" helperText="Nhap cach nhau bang dau phay" {...register("requiredSkills")} />
          <label className="space-y-1 sm:col-span-2">
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Mo ta</span>
            <textarea className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" rows={3} {...register("description")} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
            <input type="checkbox" {...register("isActive")} />
            Dang hoat dong
          </label>
        </div>
      </Modal>
    </div>
  );
}
