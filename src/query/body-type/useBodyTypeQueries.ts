import { useQuery } from "@tanstack/react-query";
import { bodyCarRouteFn } from "src/services/api/functions/BodyCar/Routes.Fn";
import { bodyTypeKeys } from "./keys";

export function useBodyTypeList() {
  return useQuery({
    queryKey: bodyTypeKeys.lists(),
    queryFn: () => bodyCarRouteFn.getBodyCars(),
    staleTime: 5 * 60_000,
  });
}
