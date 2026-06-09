import { RotateCcw, Search } from "lucide-react";

import { Input } from "@/components/common";
import { Select } from "src/components/core/Select/Select";
import type { LocationResponse } from "src/shared/types/Reponse/Location";
import { ActionButton } from "../../Workshop/workshopUi";
import { locationIdOf, ROLE_OPTIONS, type LocationOption } from "../staffHelpers";

type Props = {
  draft: { keyword: string; roleID: string; locationID: string; isActive: string };
  locations: LocationResponse[];
  locationsLoading: boolean;
  onDraftChange: (field: "keyword" | "roleID" | "locationID" | "isActive", value: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export function StaffFilters({ draft, locations, locationsLoading, onDraftChange, onApply, onClear }: Props) {
  const locationOptions = locations.map((loc, idx) => ({
    value: String(locationIdOf(loc as LocationOption, idx)),
    label: String(loc.locationName ?? ""),
  }));

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
      <Input
        label="Từ khóa"
        value={draft.keyword}
        onChange={(e) => onDraftChange("keyword", e.target.value)}
        placeholder="Tên, username, email"
      />
      <Select
        label="Role"
        options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
        placeholder="Tất cả"
        value={draft.roleID}
        onChange={(e) => onDraftChange("roleID", e.target.value)}
      />
      <Select
        label="Location"
        options={locationOptions}
        placeholder="Tất cả"
        disabled={locationsLoading}
        value={draft.locationID}
        onChange={(e) => onDraftChange("locationID", e.target.value)}
      />
      <Select
        label="Trạng thái"
        options={[
          { value: "true", label: "Đang hoạt động" },
          { value: "false", label: "Đã khóa" },
        ]}
        placeholder="Tất cả"
        value={draft.isActive}
        onChange={(e) => onDraftChange("isActive", e.target.value)}
      />
      <div className="flex items-end gap-2">
        <ActionButton variant="primary" onClick={onApply}>
          <Search className="mr-2 h-4 w-4" />
          Lọc
        </ActionButton>
        <ActionButton onClick={onClear}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Xóa lọc
        </ActionButton>
      </div>
    </div>
  );
}
