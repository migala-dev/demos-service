import { Global, Module } from '@nestjs/common';
import { UserRepository } from './database/services/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserDevicesRepository } from './database/services/user-device.repository';
import { UserDevice } from './database/entities/user-device.entity';
import { Space } from './database/entities/space.entity';
import { Member } from './database/entities/member.entity';
import { SpaceRepository } from './database/services/space.repository';
import { MemberRepository } from './database/services/member.repository';
import { Cache } from './database/entities/cache.entity';
import { CacheRepository } from './database/services/cache.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevice, Space, Member, Cache])],
  providers: [
    UserRepository,
    ConfigService,
    UserDevicesRepository,
    SpaceRepository,
    MemberRepository,
    CacheRepository,
  ],
  exports: [
    UserRepository,
    ConfigService,
    UserDevicesRepository,
    SpaceRepository,
    MemberRepository,
    CacheRepository,
  ],
})
export class CoreModule {}
