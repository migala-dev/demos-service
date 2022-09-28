import { Global, Module } from '@nestjs/common';
import { UsersService } from './database/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, ConfigService],
    exports: [UsersService, ConfigService]
})
export class CoreModule {}
