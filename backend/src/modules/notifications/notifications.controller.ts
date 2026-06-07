import { Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';

type AuthedRequest = Request & { user: JwtPayload };

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  getMyNotifications(@Req() req: AuthedRequest) {
    return this.notificationsService.getMyNotifications(req.user.sub);
  }

  @Get('me/unread-count')
  getUnreadCount(@Req() req: AuthedRequest) {
    return this.notificationsService.getUnreadCount(req.user.sub).then((count) => ({ count }));
  }

  @Patch(':id/read')
  markAsRead(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id).then(() => ({ ok: true }));
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: AuthedRequest) {
    return this.notificationsService.markAllAsRead(req.user.sub).then(() => ({ ok: true }));
  }
}
