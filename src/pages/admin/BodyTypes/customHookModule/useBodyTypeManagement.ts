import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import {
  useBodyTypeList,
  useBodyTypeMutations,
} from "src/query/body-type/useBodyTypeQueries";
import type { BodyTypePayload } from "src/services/api/functions/BodyCar/Routes.Fn";
import type { BodyCarReponse } from "src/shared/types/Reponse/Car";

export type BodyTypeFormValues = {
  bodyCode: string;
  bodyName: string;
  seatCapacityRange: string;
  description: string;
  image: File | null;
};

const emptyForm: BodyTypeFormValues = {
  bodyCode: "",
  bodyName: "",
  seatCapacityRange: "",
  description: "",
  image: null,
};

function formFromBodyType(bodyType: BodyCarReponse): BodyTypeFormValues {
  return {
    bodyCode: bodyType.bodyCode ?? "",
    bodyName: bodyType.bodyName ?? "",
    seatCapacityRange: bodyType.seatCapacityRange ?? "",
    description: bodyType.description ?? "",
    image: null,
  };
}

function toPayload(values: BodyTypeFormValues, editingBodyType: BodyCarReponse | null): BodyTypePayload {
  return {
    bodyCode: values.bodyCode.trim(),
    bodyName: values.bodyName.trim(),
    seatCapacityRange: values.seatCapacityRange.trim(),
    description: values.description.trim(),
    image: values.image,
    imagePath: editingBodyType?.imagePath ?? null,
  };
}

export function useBodyTypeManagement() {
  const { data: bodyTypes = [], isLoading, isFetching, error } = useBodyTypeList();
  const { createBodyType, updateBodyType } = useBodyTypeMutations();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBodyType, setEditingBodyType] = useState<BodyCarReponse | null>(null);

  const form = useForm<BodyTypeFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const filteredBodyTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bodyTypes;

    return bodyTypes.filter((bodyType) =>
      [bodyType.bodyCode, bodyType.bodyName, bodyType.seatCapacityRange]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [bodyTypes, search]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingBodyType(null);
    form.reset(emptyForm);
  };

  const openCreate = () => {
    setEditingBodyType(null);
    form.reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (bodyType: BodyCarReponse) => {
    setEditingBodyType(bodyType);
    form.reset(formFromBodyType(bodyType));
    setModalOpen(true);
  };

  const submitForm = form.handleSubmit(async (values) => {
    try {
      const payload = toPayload(values, editingBodyType);

      if (editingBodyType) {
        await updateBodyType.mutateAsync({
          bodyCode: editingBodyType.bodyCode,
          data: payload,
        });
        notify.success("Cap nhat kieu than xe thanh cong");
      } else {
        await createBodyType.mutateAsync(payload);
        notify.success("Tao kieu than xe thanh cong");
      }

      closeModal();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  });

  return {
    error,
    search,
    setSearch,
    modalOpen,
    editingBodyType,
    filteredBodyTypes,
    form,
    isLoading,
    isSaving: createBodyType.isPending || updateBodyType.isPending,
    isSyncing: isFetching && !isLoading,
    closeModal,
    openCreate,
    openEdit,
    submitForm,
  };
}
