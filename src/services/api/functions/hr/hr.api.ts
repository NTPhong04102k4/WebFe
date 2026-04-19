import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  PagedResult,
  SkillViewModel,
  TechnicianListParams,
} from "./hr.types";

export const hrApi = {
  listSkills: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<SkillViewModel[]>(
      API.hr.skills.list,
      withSignal({}, options)
    );
    return res.data;
  },

  getSkill: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<SkillViewModel>(
      API.hr.skills.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  listTechnicians: async (
    params: TechnicianListParams,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<PagedResult<unknown>>(
      API.hr.technicians.list,
      withSignal({ params }, options)
    );
    return res.data;
  },
};
