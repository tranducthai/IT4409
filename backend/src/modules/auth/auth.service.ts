import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { SafeUser, UsersService } from '../users/users.service';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

export type AuthTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: string;
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

  async register(dto: AuthRegisterDto): Promise<AuthTokenResponse> {
    const existing: User | null = await this.usersRepository.findByEmail(
      dto.email,
    );
    if (existing) throw new ConflictException('Email already exists');

    const created = await this.usersService.create(dto);

    const expiresIn = this.getExpiresIn();
    const access_token = await this.jwtService.signAsync({
      sub: created.id,
      email: created.email,
      role: created.role,
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: created,
    };
  }

  async login(dto: AuthLoginDto): Promise<AuthTokenResponse> {
    const user: User | null = await this.usersRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const safeUser: SafeUser = this.usersService.sanitize(user);

    const expiresIn = this.getExpiresIn();
    const access_token = await this.jwtService.signAsync({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: safeUser,
    };
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
    await this.usersRepository.updateOne(userId, { password: hashed });

    return { changed: true };
  }
}
