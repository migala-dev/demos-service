import { Module } from '@nestjs/common';

import { WsGateway } from './gateways/ws.gateway';
import { WsService } from './services/ws.service';

@Module({
  providers: [WsGateway, WsService]
})
export class WsModule {}
