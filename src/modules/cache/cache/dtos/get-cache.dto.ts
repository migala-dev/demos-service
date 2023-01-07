import { IsDateString, IsOptional } from 'class-validator';

export class GetCacheDto {
  @IsDateString()
  @IsOptional()
  lastUpdatedDate: string;
}
