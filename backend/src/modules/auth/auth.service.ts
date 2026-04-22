import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { SafeUser, UsersService } from '../users/users.service';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

export type AuthTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: string;
  refresh_expires_in: string;
  user: SafeUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  private getExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '15m');
  }

  private getRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }

  private async issueTokens(user: SafeUser) {
    const expiresIn = this.getExpiresIn();
    const refreshExpiresIn = this.getRefreshExpiresIn();

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refresh_token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.getRefreshSecret(),
        expiresIn: refreshExpiresIn as StringValue,
      },
    );

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer' as const,
      expires_in: expiresIn,
      refresh_expires_in: refreshExpiresIn,
      user,
    };
  }

  async register(dto: AuthRegisterDto): Promise<AuthTokenResponse> {
    const existing: User | null = await this.usersRepository.findByEmail(
      dto.email,
    );
    if (existing) throw new ConflictException('Email already exists');

    const created = await this.usersService.create(dto);

    return this.issueTokens(created);
  }

  async login(dto: AuthLoginDto): Promise<AuthTokenResponse> {
    const user: User | null = await this.usersRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const safeUser: SafeUser = this.usersService.sanitize(user);

    return this.issueTokens(safeUser);
  }

  async refresh(refresh_token: string): Promise<AuthTokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refresh_token,
        {
          secret: this.getRefreshSecret(),
        },
      );

      const user: User | null = await this.usersRepository.findById(
        payload.sub,
      );
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      const safeUser: SafeUser = this.usersService.sanitize(user);
      return this.issueTokens(safeUser);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const user: User | null = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.updateOne(userId, {
      password: hashed,
    });

    return { changed: true };
  }
}
