import type { ReleaseStatus } from 'common/types/requests/releases';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { releaseStatuses } from 'common/types/requests/releases';

export class ReleasesFilters {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsIn(releaseStatuses)
  status?: ReleaseStatus;
};
