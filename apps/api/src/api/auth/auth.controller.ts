import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

import { CurrentUser } from 'core/auth/current-user.types';
import { AuthService } from 'core/auth/auth.service';

import { CurrentUserParam } from './current-user.decorator';
import { Public } from './public.decorator';

class LoginDto {
  @IsString()
  login!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

class RefreshDto {
  @IsString()
  refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.login, body.password);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Public()
  @Post('logout')
  async logout(@Body() body: Partial<RefreshDto>) {
    await this.authService.logout(body.refreshToken ?? null);
    return { ok: true };
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUserParam() user: CurrentUser) {
    return this.authService.me(user.id);
  }

  @ApiBearerAuth()
  @Post('telegram/link-code')
  createTelegramLinkCode(@CurrentUserParam() user: CurrentUser) {
    return this.authService.createTelegramLinkCode(user);
  }
}
