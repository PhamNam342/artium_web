import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';

import { RedisService } from '../../common/redis/redis.service';
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

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

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

      const { sub: userId, jti } = payload;

      if (!userId || !jti) {
        console.log(
          `Notification socket rejected: ${client.id} - invalid token`,
        );

        client.disconnect();
        return;
      }

      const revoked = await this.redisService.exists(`auth:revoked:${jti}`);

      if (revoked) {
        console.log(
          `Notification socket rejected: ${client.id} - revoked token`,
        );

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
    const authToken: unknown = client.handshake.auth?.token;

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
