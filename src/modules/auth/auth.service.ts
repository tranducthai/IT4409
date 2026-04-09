import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/repositories/users.repository';
import { SafeUser, UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';

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
  ) {}

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
}
