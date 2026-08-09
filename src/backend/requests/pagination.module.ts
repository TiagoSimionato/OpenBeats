import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import 'reflect-metadata';

export class Pagination {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  perPage: number;
};
