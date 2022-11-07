import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSpaceInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(51)
  @Max(100)
  @IsOptional()
  approvalPercentage?: number;

  @IsInt()
  @Min(51)
  @Max(100)
  @IsOptional()
  participationPercentage?: number;
}
