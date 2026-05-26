import { useQuery } from "@tanstack/react-query";
import type { HookQueryOptions } from "types/reactQuery";
import { caaApi } from "..";

type CoverImage = {
  front?: boolean;
  image?: string;
  thumbnails?: {
    250?: string;
    500?: string;
    large?: string;
    small?: string;
  };
};

export type CoverResponse = {
  images?: CoverImage[];
};

export const useCover = ({
  options,
  releaseId,
}: {
  options?: HookQueryOptions<CoverResponse>;
  releaseId: string;
}) =>
  useQuery({
    queryFn: () => caaApi.get<CoverResponse>(`release/${releaseId}`),
    queryKey: [
      'caa',
      releaseId
    ],
    ...options,
  });
