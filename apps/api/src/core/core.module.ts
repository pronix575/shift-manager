import { Module } from '@nestjs/common';

import { CoreAuthModule } from './auth/auth.module';
import { DepartmentsService } from './departments/departments.service';
import { OrganizationsService } from './organizations/organizations.service';
import { PrismaModule } from './prisma/prisma.module';
import { ShiftsService } from './shifts/shifts.service';
import { StatsService } from './shifts/stats.service';
import { UsersService } from './users/users.service';
import { XlsxExportService } from './xlsx/xlsx-export.service';

@Module({
  imports: [PrismaModule, CoreAuthModule],
  providers: [
    DepartmentsService,
    OrganizationsService,
    ShiftsService,
    StatsService,
    UsersService,
    XlsxExportService,
  ],
  exports: [
    CoreAuthModule,
    DepartmentsService,
    OrganizationsService,
    ShiftsService,
    StatsService,
    UsersService,
    XlsxExportService,
  ],
})
export class CoreModule {}
