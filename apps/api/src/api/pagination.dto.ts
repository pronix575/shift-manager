import { IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  perPage?: string;
}
