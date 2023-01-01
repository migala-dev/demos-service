import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { WebSocket, Server } from 'ws';

@WebSocketGateway({ cors: true })
export class CacheGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly wss: Server;

  private readonly logger: Logger = new Logger(CacheGateway.name);
  private readonly clients: { [key: string]: WebSocket } = {};

  public handleConnection(client: WebSocket): void {
    const userID = client.url.slice(1);
    if (userID) {
      this.clients[userID] = client;
      this.logger.log(
        `User Connected: ${userID}. At: ${new Date().toISOString()}`,
      );
    } else {
      this.logger.log('Anonymous user connected');
    }
  }

  public handleDisconnect(client: any): void {
    throw new Error('Method not implemented.');
  }

  public notifyUser(toUserId: string, eventName: string): void {
    this.logger.log(`To: ${toUserId}, Event name: ${eventName}`);
    const toUserWebSocket = this.clients[toUserId];
    if (toUserWebSocket) {
      this.logger.log(`Message sended to: ${toUserId}`);
      toUserWebSocket.send(JSON.stringify(eventName));
    }
  }
}
