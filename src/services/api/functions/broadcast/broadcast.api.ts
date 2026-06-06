import apiClient from "../..";
import { API } from "../../endpoints";
import type { BroadcastQueryRequest, BroadcastRequest } from "src/shared/types/Request/Broadcast";
import type { BroadcastListResult, BroadcastViewModel } from "src/shared/types/Reponse/Broadcast";
import type { OperationResult } from "src/services/types/common.types";

export const broadcastApi = {
  list: async (params: BroadcastQueryRequest, signal?: AbortSignal): Promise<BroadcastListResult> => {
    const res = await apiClient.get(API.broadcast.list, { params, signal });
    return res.data;
  },

  getById: async (id: number, signal?: AbortSignal): Promise<BroadcastViewModel> => {
    const res = await apiClient.get<OperationResult<BroadcastViewModel>>(API.broadcast.detail(id), { signal });
    return res.data.data as BroadcastViewModel;
  },

  create: async (data: BroadcastRequest): Promise<OperationResult> => {
    const res = await apiClient.post<OperationResult>(API.broadcast.list, data);
    return res.data;
  },

  update: async (id: number, data: BroadcastRequest): Promise<OperationResult> => {
    const res = await apiClient.put<OperationResult>(API.broadcast.detail(id), data);
    return res.data;
  },

  delete: async (id: number): Promise<OperationResult> => {
    const res = await apiClient.delete<OperationResult>(API.broadcast.detail(id));
    return res.data;
  },

  sendNow: async (id: number): Promise<OperationResult> => {
    const res = await apiClient.post<OperationResult>(API.broadcast.send(id));
    return res.data;
  },
};
