import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

import { CurrentUser } from 'core/auth/current-user.types';
import { StatsService } from 'core/shifts/stats.service';
import { UserRole } from 'generated/prisma/enums';

import { CurrentUserParam } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { parseOptionalDate } from '../query.utils';

class StatsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

@ApiBearerAuth()
@ApiTags('stats')
@Roles(UserRole.ORG_MANAGER)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  summary(@CurrentUserParam() actor: CurrentUser, @Query() query: StatsQueryDto) {
    return this.statsService.getSummary(actor, {
      from: parseOptionalDate(query.from),
      to: parseOptionalDate(query.to),
      employeeId: query.employeeId,
      departmentId: query.departmentId,
    });
  }
}
