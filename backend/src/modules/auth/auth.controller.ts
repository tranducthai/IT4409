import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.usersService.findOne(req.user.sub);
  }
}
