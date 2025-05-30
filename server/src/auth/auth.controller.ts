import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, Credentials } from './auth.service';
import { Post, Body } from '@nestjs/common/decorators';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService : AuthService
  ) {}
  
  @Public()
  @Post('register')
  async registerUser(
    @Body() body: User
  ) : Promise<User> {
    return await this.authService.createUser(body)
  }

  @Public()
  @Post('login')
  async LoginUser(
    @Body() props : Credentials
  ) : Promise<{access_token : string}> {
    return await this.authService.validateUser(props)
  }
}
