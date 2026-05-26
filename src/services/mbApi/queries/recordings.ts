import { useQuery } from "@tanstack/react-query";
import { mbApi } from "services";
import type { HookQueryOptions } from "types/reactQuery";
import type { QueryReleaseResponse, RecordingsResponse } from "../types";

const MUSICBRAINZ_QUERY_QUEY = ["musicbrainz"]
const MUSICBRAINZ_RELEASES_QUERY_QUEY = [...MUSICBRAINZ_QUERY_QUEY, "releases"]

export const useMBQueryRelease = ({
  options,
  query,
}: {
  options?: HookQueryOptions<QueryReleaseResponse>;
  query: string;
}) =>
  useQuery({
    queryFn: () =>
      mbApi.get(`release`, {
        params: {
          query,
        },
      }),
    queryKey: [
      ...MUSICBRAINZ_RELEASES_QUERY_QUEY,
      query,
    ],
    ...options,
  });

export const useMBGetRecording = ({
  options,
  recordingId,
}: {
  options?: HookQueryOptions<RecordingsResponse>;
  recordingId: string;
}) =>
  useQuery({
    queryFn: () =>
      mbApi.get(`recording/${recordingId}`, {
        params: {
          inc: "media+releases+artist-credits+release-groups",
        },
      }),
    queryKey: [
      "",
    ],
    ...options,
  });
