import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { jwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.gaurd';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports : [
    ConfigModule, // ✅ add config module
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, jwtStrategy, {provide : APP_GUARD, useClass : AuthGuard}],
})
export class AuthModule {}
