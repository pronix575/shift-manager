import { Body, Controller, Param, Post, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'api/auth/public.decorator';

import { TelegramBotService } from './telegram-bot.service';

@ApiTags('telegram')
@Public()
@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly configService: ConfigService,
    private readonly telegramBotService: TelegramBotService,
  ) {}

  @Post('webhook/:secret')
  async webhook(@Param('secret') secret: string, @Body() update: unknown) {
    if (secret !== this.configService.getOrThrow<string>('TELEGRAM_WEBHOOK_SECRET')) {
      throw new ForbiddenException('Invalid webhook secret');
    }

    await this.telegramBotService.handleWebhook(update);

    return { ok: true };
  }
}
