import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @IsString()
  @IsNotEmpty()
  session: string;
}