import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ArrivalService } from './arrival.service';
import { BleEventDto } from './dto/arrival.dto';

/**
 * WebSocket gateway for real-time BLE arrival events.
 *
 * Connection: clients must send JWT in handshake auth:
 *   socket = io(url, { auth: { token: 'Bearer eyJ...' } })
 *
 * Events in:  'ble_scan'   → BleEventDto payload
 * Events out: 'arrival_confirmed'  → { match_id, user_id, both_arrived }
 *             'arrival_error'      → { message }
 */
@WebSocketGateway({
  namespace: '/arrival',
  cors: {
    origin: (origin: string, cb: (err: Error | null, allow?: boolean) => void) => {
      const allowed = (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
        .split(',')
        .map((o) => o.trim());
      cb(null, !origin || allowed.includes(origin));
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ArrivalGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ArrivalGateway.name);

  constructor(
    private readonly arrivalService: ArrivalService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('ArrivalGateway initialized');

    // JWT auth middleware on socket connection
    server.use((socket, next) => {
      const token =
        socket.handshake.auth?.token as string | undefined ??
        socket.handshake.headers?.authorization as string | undefined;

      if (!token) {
        return next(new Error('Missing authentication token'));
      }

      const raw = token.startsWith('Bearer ') ? token.slice(7) : token;

      try {
        const payload = this.jwtService.verify(raw, {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });
        (socket as Socket & { user: unknown }).user = payload;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ble_scan')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleBleScan(
    @MessageBody() dto: BleEventDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const user = (client as Socket & { user?: { sub: string } }).user;
    if (!user) {
      client.emit('arrival_error', { message: 'Unauthorized' });
      return;
    }

    // Enforce that the event user_id matches the authenticated user
    if (dto.user_id !== user.sub) {
      client.emit('arrival_error', {
        message: 'user_id does not match authenticated user',
      });
      return;
    }

    try {
      const result = await this.arrivalService.processBleEvent(dto);

      // Join a match-specific room so we can broadcast to both participants
      await client.join(`match:${dto.match_id}`);

      client.emit('arrival_confirmed', {
        match_id: dto.match_id,
        user_id: dto.user_id,
        both_arrived: result.both_arrived,
      });

      if (result.both_arrived) {
        // Broadcast to all sockets in the match room
        this.server
          .to(`match:${dto.match_id}`)
          .emit('arrival_confirmed', {
            match_id: dto.match_id,
            user_id: dto.user_id,
            both_arrived: true,
            message: 'Both users have arrived at the venue!',
          });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Arrival processing failed';
      client.emit('arrival_error', { message });
    }
  }

  /** Called by the REST controller to also notify via WebSocket */
  emitArrivalConfirmed(matchId: string, payload: unknown): void {
    this.server.to(`match:${matchId}`).emit('arrival_confirmed', payload);
  }
}
