import { useQuery } from "@tanstack/react-query";
import { mbApi } from "services";
import type { HookQueryOptions } from "types/reactQuery";
import type { RecordingsResponse } from "../types";

export const useGetRecording = ({
  options,
}: {
  options?: HookQueryOptions<RecordingsResponse>;
  resource: string;
}) =>
  useQuery({
    queryFn: () =>
      mbApi.get("/recording", {
        params: {},
      }),
    queryKey: [
      "",
    ],
    ...options,
  });
