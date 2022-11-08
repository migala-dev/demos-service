import { Module } from '@nestjs/common';
import { SpacesController } from './spaces/spaces.controller';

@Module({

  controllers: [SpacesController]
})
export class SpacesModule {}
