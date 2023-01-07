import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokensDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
