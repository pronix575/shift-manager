import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { ApiModule } from 'api/api.module';
import { JwtAuthGuard } from 'api/auth/jwt-auth.guard';
import { RolesGuard } from 'api/auth/roles.guard';
import { validateEnv } from 'core/config/env';
import { CoreModule } from 'core/core.module';
import { TelegramModule } from 'telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
      isGlobal: true,
      validate: validateEnv,
    }),
    CoreModule,
    ApiModule,
    TelegramModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
