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

  async signInEmail(
      // userWhereUniqueInput : Prisma.UserWhereUniqueInput,
      email : string,
      pass : string
    
  ): Promise<{ userId : string , access_token: string }> {
    const user = await this.userService.validateUser({email});
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const decryptedpass = await bcrypt.compare(pass, user.password);
    if (!decryptedpass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.email };
    return {
      userId : user.id,
      access_token: await this.jwtService.signAsync(payload),
    };
  }


  async singInUsername(
    username : string,
    pass : string
  ) : Promise<{ userId : string, access_token: string }> {
    const user = await this.userService.validateUser({username});
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const decryptedpass = await bcrypt.compare(pass, user.password);
    if (!decryptedpass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username };
    return {
      userId : user.id,
      access_token: await this.jwtService.signAsync(payload),
    };

  }


  async singInMobile(
    phnum : string,
    pass : string
  ) : Promise<{ userId : string, access_token: string }> {
    const user = await this.userService.validateUser({phnum});
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const decryptedpass = await bcrypt.compare(pass, user.password);
    if (!decryptedpass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username };
    return {
      userId : user.id,
      access_token: await this.jwtService.signAsync(payload),
    };

  }
}
