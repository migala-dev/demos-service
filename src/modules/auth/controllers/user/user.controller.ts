import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserFromRequest } from '../../../../core/decorators/auth/user-from-request/user-from-request.decorator';
import { User } from '../../../../core/database/entities/user.entity';
import { UserService } from './services/user/user.service';
import { RecoverData } from './models/recover-data.model';

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

  @Get('recover-user-data')
  public recoverUserData(@UserFromRequest() user: User): Promise<RecoverData> {
    return this.userService.recoverUserData(user.userId);
  }
}
