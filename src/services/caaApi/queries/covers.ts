import { useQuery } from "@tanstack/react-query";
import type { HookQueryOptions } from "types/reactQuery";
import { caaApi } from "..";

export const useCover = ({
  releaseId,
}: {
  options?: HookQueryOptions<unknown>;
  releaseId: string;
}) =>
  useQuery({
    queryFn: () => caaApi.get(`/${releaseId}/front`),
    queryKey: [
      'caa',
      releaseId
    ]
  });
