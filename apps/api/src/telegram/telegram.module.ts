import { Module } from '@nestjs/common';

import { CoreModule } from 'core/core.module';

import { TelegramBotService } from './telegram-bot.service';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [CoreModule],
  controllers: [TelegramController],
  providers: [TelegramBotService],
})
export class TelegramModule {}
