import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserFromRequest } from '../../../../core/decorators/auth/user-from-request/user-from-request.decorator';
import { User } from '../../../../core/database/entities/user.entity';
import { UserService } from './services/user/user.service';
import { UpdateUserNameDto } from './dtos/update-user-name.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  public updateProfilePicture(
    @UserFromRequest() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.userService.uploadAvatarImage(user, file);
  }

  @Put('/')
  public updateUserName(
    @UserFromRequest() user: User,
    @Body() { name }: UpdateUserNameDto,
  ): Promise<User> {
    return this.userService.updateUserName(user, name);
  }
}
