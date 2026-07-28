import { IsInt, Min } from 'class-validator';

export class Pagination {
  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(0)
  perPage: number;
};
