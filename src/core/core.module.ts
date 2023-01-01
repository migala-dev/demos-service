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
import { CacheGateway } from './gateways/cache/cache.gateway';
import { CacheEmitterService } from './services/cache-emitter/cache-emitter.service';
import { MemberNotificationService } from './services/notifications/member-notification/member-notification.service';
import { NotifierService } from './services/notifications/utils/notifier/notifier.service';
import { Cache } from './database/entities/cache.entity';
import { CacheService } from './database/services/cache.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevice, Space, Member, Cache])],
  providers: [
    UsersService,
    ConfigService,
    UserDevicesService,
    SpacesService,
    MembersService,
    CacheService,
    CacheGateway,
    CacheEmitterService,
    MemberNotificationService,
    NotifierService,
  ],
  exports: [
    UsersService,
    ConfigService,
    UserDevicesService,
    SpacesService,
    MembersService,
    MemberNotificationService,
  ],
})
export class CoreModule {}
