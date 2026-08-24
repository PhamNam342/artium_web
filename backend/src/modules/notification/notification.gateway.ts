import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';

import type { JwtPayload } from '../../identity/auth/interfaces/jwt-payload.interface';
import type { NotificationSocket } from './interfaces/notification-socket.interface';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(
    @ConnectedSocket() client: NotificationSocket,
  ): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        console.log(`Notification socket rejected: ${client.id} - no token`);

        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      const userId = payload.sub;

      if (!userId) {
        console.log(`Notification socket rejected: ${client.id} - no userId`);

        client.disconnect();
        return;
      }

      await client.join(`user:${userId}`);

      client.data.userId = userId;

      console.log(
        `Notification socket connected: ${client.id} - user: ${userId}`,
      );
    } catch (error) {
      console.error(
        `Notification socket authentication failed: ${client.id}`,
        error,
      );

      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: NotificationSocket): void {
    console.log(`Notification socket disconnected: ${client.id}`);
  }

  sendToUser(userId: string, notification: unknown): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  private extractToken(client: NotificationSocket): string | null {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string') {
      return authToken.startsWith('Bearer ')
        ? authToken.substring(7)
        : authToken;
    }

    const authorization = client.handshake.headers.authorization;

    if (
      typeof authorization === 'string' &&
      authorization.startsWith('Bearer ')
    ) {
      return authorization.substring(7);
    }

    return null;
  }
}
