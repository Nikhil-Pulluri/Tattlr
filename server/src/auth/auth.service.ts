
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signIn(
      // userWhereUniqueInput : Prisma.UserWhereUniqueInput,
      email : string,
      pass : string
    
  ): Promise<{ access_token: string }> {
    const user : User = await this.userService.validateUser({email});
    const password = user?.password
    const decryptedpass = await bcrypt.compare(pass, password);
    if (!decryptedpass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
