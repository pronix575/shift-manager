import { Body, Controller, Get, Header, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import type { Response } from 'express';

import { CurrentUser } from 'core/auth/current-user.types';
import { ownShiftWorkerRoles } from 'core/auth/role-policy';
import { ShiftsService } from 'core/shifts/shifts.service';
import { UserRole } from 'generated/prisma/enums';

import { CurrentUserParam } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../pagination.dto';
import { parseOptionalDate, parsePagination } from '../query.utils';

class ShiftQueryDto extends PaginationQueryDto {
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

class StartShiftDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

class UpdateShiftDto {
  @IsOptional()
  @IsISO8601()
  startedAt?: string;

  @IsOptional()
  @IsISO8601()
  endedAt?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

@ApiBearerAuth()
@ApiTags('shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Roles(UserRole.ORG_MANAGER)
  @Get()
  list(@CurrentUserParam() actor: CurrentUser, @Query() query: ShiftQueryDto) {
    return this.shiftsService.listForManager(
      actor,
      this.mapQuery(query),
      parsePagination(query),
    );
  }

  @Roles(...ownShiftWorkerRoles)
  @Get('me')
  listMine(@CurrentUserParam() actor: CurrentUser, @Query() query: ShiftQueryDto) {
    return this.shiftsService.listForEmployee(
      actor,
      this.mapQuery(query),
      parsePagination(query),
    );
  }

  @Roles(...ownShiftWorkerRoles)
  @Post('start')
  start(@CurrentUserParam() actor: CurrentUser, @Body() body: StartShiftDto) {
    return this.shiftsService.startShift(actor, body);
  }

  @Roles(UserRole.EMPLOYEE, UserRole.ORG_MANAGER, UserRole.ADMIN)
  @Post(':id/finish')
  finish(@CurrentUserParam() actor: CurrentUser, @Param('id') id: string) {
    return this.shiftsService.finishShift(actor, id);
  }

  @Roles(UserRole.EMPLOYEE, UserRole.ORG_MANAGER, UserRole.ADMIN)
  @Patch(':id')
  update(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Body() body: UpdateShiftDto,
  ) {
    return this.shiftsService.updateShift(actor, id, {
      startedAt: parseOptionalDate(body.startedAt),
      endedAt:
        body.endedAt === undefined || body.endedAt === ''
          ? undefined
          : parseOptionalDate(body.endedAt) ?? null,
      departmentId: body.departmentId,
      comment: body.comment,
    });
  }

  @Roles(UserRole.ORG_MANAGER)
  @Get('export.xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async export(
    @CurrentUserParam() actor: CurrentUser,
    @Query() query: ShiftQueryDto,
    @Res() response: Response,
  ) {
    const workbookBuffer = await this.shiftsService.exportXlsx(
      actor,
      this.mapQuery(query),
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="shifts.xlsx"',
    );
    response.send(Buffer.from(workbookBuffer as ArrayBuffer));
  }

  private mapQuery(query: ShiftQueryDto) {
    return {
      from: parseOptionalDate(query.from),
      to: parseOptionalDate(query.to),
      employeeId: query.employeeId,
      departmentId: query.departmentId,
    };
  }
}
