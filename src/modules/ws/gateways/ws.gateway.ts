import { WebSocketGateway } from '@nestjs/websockets';
import { WsService } from './ws.service';

@WebSocketGateway()
export class WsGateway {
  constructor(private readonly wsService: WsService) {}
}
