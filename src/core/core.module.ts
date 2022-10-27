import { Global, Module } from '@nestjs/common';
import { UsersService } from './database/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserDevicesService } from './database/services/user-device.service';
import { UserDevice } from './database/entities/user-device.entity';
import { Space } from './database/entities/space.entity';
import { Member } from './database/entities/member.entity';
import { SpacesService } from './database/services/space.service';
import { MembersService } from './database/services/member.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User, UserDevice, Space, Member])],
    providers: [UsersService, ConfigService, UserDevicesService, SpacesService, MembersService],
    exports: [UsersService, ConfigService, UserDevicesService, SpacesService, MembersService],
})
export class CoreModule {}
