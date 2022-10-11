import { Global, Module } from '@nestjs/common';
import { UsersService } from './database/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserDevicesService } from './database/services/user-device.service';
import { UserDevice } from './database/entities/user-device.entity';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User, UserDevice])],
    providers: [UsersService, ConfigService, UserDevicesService],
    exports: [UsersService, ConfigService, UserDevicesService]
})
export class CoreModule {}
