import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserFromRequest } from '../../../../core/decorators/auth/user-from-request/user-from-request.decorator';
import { User } from '../../../../core/database/entities/user.entity';
import { UserService } from './services/user/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  public updateProfilePicture(
    @UserFromRequest() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatarImage(user, file);
  }
}
