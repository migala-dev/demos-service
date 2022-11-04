import { IsMobilePhone, IsString, IsUUID, ValidateIf } from 'class-validator';

export class UserToInviteDto {
  @IsString()
  @IsMobilePhone()
  @ValidateIf((user) => user.userId === undefined || user.phoneNumber)
  phoneNumber?: string;

  @IsString()
  @IsUUID()
  @ValidateIf((user) => user.phoneNumber === undefined || user.userId)
  userId?: string;
}
