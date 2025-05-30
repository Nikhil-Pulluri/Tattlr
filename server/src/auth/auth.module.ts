import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { jwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.gaurd';
@Module({
  imports : [
    PassportModule,
    JwtModule.register({
      global : true,
      secret : process.env.JWT_SECRET,
      signOptions : {expiresIn : '1h'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, jwtStrategy, {provide : APP_GUARD, useClass : AuthGuard}],
})
export class AuthModule {}
