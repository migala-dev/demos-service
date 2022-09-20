import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;
}
