import { IsUrl, IsUUID } from 'class-validator';

export class CustomTrackRequest {
  @IsUrl()
  url: string;

  @IsUUID()
  trackId: string;
};
