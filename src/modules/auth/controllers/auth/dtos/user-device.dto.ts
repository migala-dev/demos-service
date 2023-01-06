import { IsNotEmpty, IsString } from 'class-validator';

export class UserDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
