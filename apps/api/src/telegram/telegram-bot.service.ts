import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context, Keyboard } from 'grammy';

import { AuthService } from 'core/auth/auth.service';
import { CurrentUser } from 'core/auth/current-user.types';
import { ShiftsService } from 'core/shifts/shifts.service';
import { ShiftSource } from 'generated/prisma/enums';

const mainKeyboard = new Keyboard()
  .text('Начать смену')
  .text('Завершить смену')
  .row()
  .text('Мои смены')
  .resized();

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Bot | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly shiftsService: ShiftsService,
  ) {}

  async onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const mode = this.configService.get<string>('TELEGRAM_BOT_MODE');

    if (!token || mode === 'disabled') {
      this.logger.log('Telegram bot is disabled');
      return;
    }

    this.bot = new Bot(token);
    this.registerHandlers(this.bot);

    if (mode === 'polling') {
      await this.bot.start();
      this.logger.log('Telegram bot started in polling mode');
    }
  }

  async onModuleDestroy() {
    await this.bot?.stop();
  }

  async handleWebhook(update: unknown) {
    if (!this.bot) {
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

      if (!token) {
        return;
      }

      this.bot = new Bot(token);
      this.registerHandlers(this.bot);
    }

    await this.bot.handleUpdate(update as never);
  }

  private registerHandlers(bot: Bot) {
    bot.command('start', (ctx) => this.handleStart(ctx));
    bot.command('link', (ctx) => this.handleLink(ctx));
    bot.hears('Начать смену', (ctx) => this.handleStartShift(ctx));
    bot.hears('Завершить смену', (ctx) => this.handleFinishShift(ctx));
    bot.hears('Мои смены', (ctx) => this.handleMyShifts(ctx));
    bot.catch((error) => {
      this.logger.error(error.message, error.stack);
    });
  }

  private async handleStart(ctx: Context) {
    const user = await this.getLinkedUser(ctx);

    if (!user) {
      await ctx.reply(
        'Откройте веб-приложение, получите код привязки Telegram и отправьте /link 123456.',
      );
      return;
    }

    await ctx.reply('Бот готов к работе со сменами.', {
      reply_markup: mainKeyboard,
    });
  }

  private async handleLink(ctx: Context) {
    const telegramId = this.getTelegramId(ctx);
    const code = ctx.match?.toString().trim();

    if (!telegramId || !code) {
      await ctx.reply('Используйте команду в формате /link 123456.');
      return;
    }

    await this.authService.linkTelegramByCode(
      code,
      telegramId,
      ctx.from?.username,
    );
    await ctx.reply('Telegram привязан к аккаунту.', {
      reply_markup: mainKeyboard,
    });
  }

  private async handleStartShift(ctx: Context) {
    const user = await this.requireLinkedUser(ctx);
    const shift = await this.shiftsService.startShift(user, {
      source: ShiftSource.TELEGRAM,
    });

    await ctx.reply(
      `Смена начата: ${shift.startedAt.toLocaleString('ru-RU')}.`,
      { reply_markup: mainKeyboard },
    );
  }

  private async handleFinishShift(ctx: Context) {
    const user = await this.requireLinkedUser(ctx);
    const shift = await this.shiftsService.finishOpenShift(user);

    await ctx.reply(
      `Смена завершена: ${shift.endedAt?.toLocaleString('ru-RU') ?? ''}.`,
      { reply_markup: mainKeyboard },
    );
  }

  private async handleMyShifts(ctx: Context) {
    const user = await this.requireLinkedUser(ctx);
    const shifts = await this.shiftsService.listForEmployee(user, {});
    const lastShifts = shifts.slice(0, 5);

    if (lastShifts.length === 0) {
      await ctx.reply('Смен пока нет.', { reply_markup: mainKeyboard });
      return;
    }

    const text = lastShifts
      .map((shift) => {
        const started = shift.startedAt.toLocaleString('ru-RU');
        const ended = shift.endedAt?.toLocaleString('ru-RU') ?? 'открыта';
        return `${started} - ${ended}`;
      })
      .join('\n');

    await ctx.reply(text, { reply_markup: mainKeyboard });
  }

  private async requireLinkedUser(ctx: Context): Promise<CurrentUser> {
    const user = await this.getLinkedUser(ctx);

    if (!user) {
      await ctx.reply('Сначала привяжите Telegram командой /link 123456.');
      throw new Error('Telegram user is not linked');
    }

    return user;
  }

  private async getLinkedUser(ctx: Context): Promise<CurrentUser | null> {
    const telegramId = this.getTelegramId(ctx);

    if (!telegramId) {
      return null;
    }

    return this.authService.getUserByTelegramId(telegramId);
  }

  private getTelegramId(ctx: Context): string | null {
    return ctx.from?.id ? String(ctx.from.id) : null;
  }
}
