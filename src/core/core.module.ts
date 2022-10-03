import { Global, Module } from '@nestjs/common';
import { UsersService } from './database/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserDeviceService } from './database/services/user-device.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, ConfigService, UserDeviceService],
    exports: [UsersService, ConfigService, UserDeviceService]
})
export class CoreModule {}
