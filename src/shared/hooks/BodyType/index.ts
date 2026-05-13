import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";

export const useBodyType = () => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useBodyTypeList();

  return {
    bodyTypes: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};
