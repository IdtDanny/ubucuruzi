import { Injectable, ConflictException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Registration (auto‑create tenant) ───
  async register(dto: RegisterDto) {
    // 1. Check if user exists
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create a tenant (company)
    const tenant = await this.prisma.tenant.create({
      data: {
        name: `${dto.firstName}'s Company`,
        email: dto.email,
      },
    });

    // 4. Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    // 5. Assign the Owner role to this user on the tenant
    const ownerRole = await this.prisma.role.findUnique({ where: { name: 'Owner' } });
    if (!ownerRole) throw new InternalServerErrorException('Default role "Owner" not found – please seed database');

    await this.prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        roleId: ownerRole.id,
        assignedBy: user.id,
      },
    });

    // 6. Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, tenant.id);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tenant: { id: tenant.id, name: tenant.name },
    };
  }

  // ─── Login ────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) throw new UnauthorizedException('Use Google login');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Get user's first tenant
    const membership = await this.prisma.userTenant.findFirst({ where: { userId: user.id } });
    if (!membership) throw new UnauthorizedException('User has no tenant assigned');

    const tokens = await this.generateTokens(user.id, user.email, membership.tenantId);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    };
  }

  // ─── Google Login / Register ──────────────
  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({ where: { googleId: googleUser.id } });
    if (!user) {
      // Check if email exists
      const existing = await this.prisma.user.findUnique({ where: { email: googleUser.email } });
      if (existing) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: existing.id },
          data: { googleId: googleUser.id, avatar: googleUser.picture },
        });
      } else {
        // Create new user and tenant
        const tenant = await this.prisma.tenant.create({
          data: {
            name: `${googleUser.firstName}'s Company`,
            email: googleUser.email,
          },
        });
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            googleId: googleUser.id,
            avatar: googleUser.picture,
          },
        });
        const ownerRole = await this.prisma.role.findUnique({ where: { name: 'Owner' } });
        if (!ownerRole) throw new InternalServerErrorException('Default role "Owner" not found');
        await this.prisma.userTenant.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
            roleId: ownerRole.id,
            assignedBy: user.id,
          },
        });
      }
    }

    // Get the tenant (we'll use the first one)
    const membership = await this.prisma.userTenant.findFirst({ where: { userId: user.id } });
    if (!membership) throw new UnauthorizedException('No tenant assigned');

    const tokens = await this.generateTokens(user.id, user.email, membership.tenantId);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    };
  }

  // ─── Token Generation ─────────────────────
  private async generateTokens(userId: string, email: string, tenantId: string) {
    const payload = { sub: userId, email, tenantId };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('jwt.secret'),
      expiresIn: this.config.get('jwt.expiresIn'),
    });
    const refreshToken = this.jwt.sign(
      { sub: userId },
      { secret: this.config.get('jwt.secret'), expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }
}