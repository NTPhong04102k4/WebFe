import { BodyCarReponse } from "src/shared/types/Reponse/Car";
import apiClient from "../..";
import { bodyCarRoute } from "./Routes";
import type { OperationResult } from "src/services/types/common.types";

export type BodyTypePayload = {
  bodyCode: string;
  bodyName: string;
  image?: File | string | null;
  imagePath?: string | null;
  description?: string | null;
  seatCapacityRange?: string | null;
};

function unwrapBodyTypes(
  payload: BodyCarReponse[] | OperationResult<BodyCarReponse[]>
) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function unwrapBodyType(
  payload: BodyCarReponse | OperationResult<BodyCarReponse>
) {
  return "data" in payload && payload.data ? payload.data : (payload as BodyCarReponse);
}

function toBodyTypeFormData(data: BodyTypePayload) {
  const form = new FormData();
  form.append("BodyCode", data.bodyCode);
  form.append("BodyName", data.bodyName);
  form.append("Description", data.description ?? "");
  form.append("SeatCapacityRange", data.seatCapacityRange ?? "");
  if (data.image instanceof File) form.append("Image", data.image);
  if (typeof data.imagePath === "string") form.append("ImagePath", data.imagePath);
  return form;
}

export const bodyCarRouteFn = {
  getBodyCars: async () => {
    const response = await apiClient.get<
      BodyCarReponse[] | OperationResult<BodyCarReponse[]>
    >(
      bodyCarRoute.getBodyCars
    );
    return unwrapBodyTypes(response.data);
  },
  createBodyType: async (data: BodyTypePayload) => {
    const response = await apiClient.post<
      BodyCarReponse | OperationResult<BodyCarReponse>
    >(bodyCarRoute.createBodyType, toBodyTypeFormData(data));
    return unwrapBodyType(response.data);
  },
  updateBodyType: async (bodyCode: string, data: BodyTypePayload) => {
    const response = await apiClient.put<
      BodyCarReponse | OperationResult<BodyCarReponse>
    >(bodyCarRoute.updateBodyType(bodyCode), toBodyTypeFormData(data));
    return unwrapBodyType(response.data);
  },
};
