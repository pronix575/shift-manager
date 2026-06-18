import { Module } from '@nestjs/common';

import { CoreModule } from 'core/core.module';

import { AuthController } from './auth/auth.controller';
import { AdminsController } from './organizations/admins.controller';
import { OrganizationController } from './organization/organization.controller';
import { OrganizationsController } from './organizations/organizations.controller';
import { ShiftsController } from './shifts/shifts.controller';
import { StatsController } from './stats/stats.controller';

@Module({
  imports: [CoreModule],
  controllers: [
    AdminsController,
    AuthController,
    OrganizationController,
    OrganizationsController,
    ShiftsController,
    StatsController,
  ],
})
export class ApiModule {}
