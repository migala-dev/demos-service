import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SpaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  @Min(51)
  @Max(100)
  @IsNotEmpty()
  approvalPercentage: number;

  @IsInt()
  @Min(51)
  @Max(100)
  @IsNotEmpty()
  participationPercentage: number;
}
