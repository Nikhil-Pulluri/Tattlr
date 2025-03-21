
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.gaurd';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login/email')
  signInithEmail(@Body() data : {
    email : string,
    password  :string
  }) {
    return this.authService.signInEmail(data.email, data.password)
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login/username')
  signInWithUsername(
    @Body() data : {
      username : string,
      password : string
    }
  ) {
    return this.authService.singInUsername(data.username, data.password)
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login/mobile')
  async signInWithMobile(
    @Body() data : {
      phnum : string,
      password : string
    }
  ) {
    return this.authService.singInMobile(data.phnum, data.password)
  }


  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
