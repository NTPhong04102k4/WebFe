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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceForm>({
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
        await mutations.updateService.mutateAsync({
          id: editing.serviceID,
          body,
        });
        notify.success("Đã cập nhật dịch vụ");
      } else {
        await mutations.createService.mutateAsync(body);
        notify.success("Đã tạo dịch vụ");
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
      notify.success("Đã cập nhật trạng thái");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const columns = useMemo<ColumnDef<ServiceCatalogViewModel>[]>(
    () => [
      {
        header: "Dịch vụ",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.serviceName}</div>
            <div className="text-xs text-slate-500">
              {row.original.serviceCode}
            </div>
          </div>
        ),
      },
      {
        header: "Danh mục",
        cell: ({ row }) => row.original.categoryName ?? row.original.categoryID,
      },
      {
        header: "Giá",
        cell: ({ row }) => formatMoney(row.original.price),
      },
      {
        header: "Thời lượng",
        cell: ({ row }) => `${row.original.estimatedDuration_minutes} phút`,
      },
      {
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge tone={row.original.isActive ? "green" : "slate"}>
            {row.original.isActive ? "Hoạt động" : "Ngừng hoạt động"}
          </Badge>
        ),
      },
      {
        header: "Ngày tạo",
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => openEdit(row.original)}>
              Sửa
            </ActionButton>
            <ActionButton onClick={() => toggleStatus(row.original)}>
              {row.original.isActive ? "Tắt" : "Bật"}
            </ActionButton>
          </div>
        ),
      },
    ],
    [],
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / (query.pageSize ?? 20)),
  );

  return (
    <div>
      <PageHeader
        title="Danh mục dịch vụ"
        description="Quản lý core.services để appointment và work order có danh sách dịch vụ chính thức."
        action={
          <ActionButton variant="primary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
          </ActionButton>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-4">
        <Input
          label="Từ khóa"
          value={draft.keyword}
          onChange={(e) => setDraft((s) => ({ ...s, keyword: e.target.value }))}
          placeholder="Tên hoặc mã dịch vụ"
        />
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Danh mục
          </span>
          <select
            value={draft.categoryID}
            onChange={(e) =>
              setDraft((s) => ({ ...s, categoryID: e.target.value }))
            }
            className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
          >
            <option value="">Tất cả</option>
            {categories.map((category) => (
              <option key={category.categoryID} value={category.categoryID}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Trạng thái
          </span>
          <select
            value={draft.isActive}
            onChange={(e) =>
              setDraft((s) => ({ ...s, isActive: e.target.value }))
            }
            className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
          >
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Ngừng hoạt động</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <ActionButton variant="primary" onClick={applyFilter}>
            <Search className="mr-2 h-4 w-4" /> Lọc
          </ActionButton>
          <ActionButton
            onClick={() => {
              setDraft({ keyword: "", categoryID: "", isActive: "true" });
              setQuery({ page: 1, pageSize: 20, isActive: true });
            }}
          >
            Xóa
          </ActionButton>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => String(row.serviceID)}
        loading={isLoading}
        emptyTitle="Chưa có dịch vụ"
        enablePagination={false}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tổng {data?.totalCount ?? 0} dịch vụ</span>
        <div className="flex gap-2">
          <ActionButton
            disabled={(query.page ?? 1) <= 1}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
          >
            Trước
          </ActionButton>
          <span className="px-2 py-2">
            Trang {query.page ?? 1}/{totalPages}
          </span>
          <ActionButton
            disabled={(query.page ?? 1) >= totalPages}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
          >
            Sau
          </ActionButton>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}
        size="xl"
        closeOnBackdrop={false}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={closeForm}>Hủy</ActionButton>
            <ActionButton
              variant="primary"
              onClick={handleSubmit(saveService)}
              disabled={
                mutations.createService.isPending ||
                mutations.updateService.isPending
              }
            >
              Lưu
            </ActionButton>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Mã dịch vụ"
            maxLength={20}
            required
            {...register("serviceCode", {
              required: "Bắt buộc",
              maxLength: 20,
            })}
            error={errors.serviceCode?.message}
          />
          <Input
            label="Tên dịch vụ"
            maxLength={200}
            required
            {...register("serviceName", {
              required: "Bắt buộc",
              maxLength: 200,
            })}
            error={errors.serviceName?.message}
          />
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Danh mục *
            </span>
            <select
              className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
              {...register("categoryID", { required: "Bắt buộc" })}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.categoryID} value={category.categoryID}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryID?.message ? (
              <p className="text-xs text-red-600">
                {errors.categoryID.message}
              </p>
            ) : null}
          </label>
          <Input
            label="Giá"
            type="number"
            min={0}
            required
            {...register("price", { required: "Bắt buộc" })}
            error={errors.price?.message}
          />
          <Input
            label="Thời lượng (phút)"
            type="number"
            min={1}
            required
            {...register("estimatedDuration_minutes", { required: "Bắt buộc" })}
            error={errors.estimatedDuration_minutes?.message}
          />
          <Input
            label="Kỹ năng yêu cầu"
            helperText="Nhập cách nhau bằng dấu phẩy"
            {...register("requiredSkills")}
          />
          <label className="space-y-1 sm:col-span-2">
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Mô tả
            </span>
            <textarea
              className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
              rows={3}
              {...register("description")}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
            <input type="checkbox" {...register("isActive")} />
            Đang hoạt động
          </label>
        </div>
      </Modal>
    </div>
  );
}
