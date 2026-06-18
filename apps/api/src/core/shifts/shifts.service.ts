import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrentUser } from 'core/auth/current-user.types';
import { canWorkWithOwnShifts } from 'core/auth/role-policy';
import { PrismaService } from 'core/prisma/prisma.service';
import { XlsxExportService } from 'core/xlsx/xlsx-export.service';
import { ShiftSource, ShiftStatus, UserRole, UserStatus } from 'generated/prisma/enums';

import { canEmployeeEditShift } from './shift-policy';

export type ShiftFilter = {
  from?: Date;
  to?: Date;
  employeeId?: string;
  departmentId?: string;
};

export type StartShiftInput = {
  departmentId?: string | null;
  comment?: string | null;
  source?: ShiftSource;
};

export type UpdateShiftInput = {
  startedAt?: Date;
  endedAt?: Date | null;
  departmentId?: string | null;
  comment?: string | null;
};

@Injectable()
export class ShiftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly xlsxExportService: XlsxExportService,
  ) {}

  async listForManager(actor: CurrentUser, filter: ShiftFilter) {
    const organizationId = this.getManagerOrganizationId(actor);

    return this.findShifts(organizationId, filter);
  }

  async listForEmployee(actor: CurrentUser, filter: ShiftFilter) {
    return this.findShifts(actor.organizationId, {
      ...filter,
      employeeId: actor.id,
    });
  }

  async startShift(actor: CurrentUser, input: StartShiftInput = {}) {
    if (!canWorkWithOwnShifts(actor.role) || !actor.organizationId) {
      throw new ForbiddenException('Смену может начать только сотрудник или менеджер');
    }

    const existingOpenShift = await this.prisma.shift.findFirst({
      where: { employeeId: actor.id, status: ShiftStatus.OPEN },
      select: { id: true },
    });

    if (existingOpenShift) {
      throw new BadRequestException('У сотрудника уже есть открытая смена');
    }

    const departmentId = await this.resolveEmployeeDepartment(
      actor.id,
      actor.organizationId,
      input.departmentId,
    );

    return this.prisma.shift.create({
      data: {
        organizationId: actor.organizationId,
        employeeId: actor.id,
        departmentId,
        source: input.source ?? ShiftSource.WEB,
        startedAt: new Date(),
        comment: input.comment?.trim() || null,
        auditLogs: {
          create: {
            actorId: actor.id,
            after: { status: ShiftStatus.OPEN },
          },
        },
      },
      include: this.shiftInclude,
    });
  }

  async finishShift(actor: CurrentUser, shiftId: string) {
    const shift = await this.findAccessibleShift(actor, shiftId);

    if (shift.status !== ShiftStatus.OPEN) {
      throw new BadRequestException('Смена уже завершена');
    }

    if (actor.role === UserRole.EMPLOYEE && shift.employeeId !== actor.id) {
      throw new ForbiddenException('Можно завершить только свою смену');
    }

    const before = this.buildShiftSnapshot(shift);
    const updated = await this.prisma.shift.update({
      where: { id: shift.id },
      data: {
        status: ShiftStatus.CLOSED,
        endedAt: new Date(),
        auditLogs: {
          create: {
            actorId: actor.id,
            before,
            after: { status: ShiftStatus.CLOSED },
          },
        },
      },
      include: this.shiftInclude,
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: updated.organizationId,
        actorId: actor.id,
        action: 'FINISH_SHIFT',
        entityType: 'Shift',
        entityId: updated.id,
      },
    });

    return updated;
  }

  async finishOpenShift(actor: CurrentUser) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        employeeId: actor.id,
        status: ShiftStatus.OPEN,
      },
      select: { id: true },
      orderBy: { startedAt: 'desc' },
    });

    if (!shift) {
      throw new NotFoundException('Открытая смена не найдена');
    }

    return this.finishShift(actor, shift.id);
  }

  async updateShift(actor: CurrentUser, shiftId: string, input: UpdateShiftInput) {
    const shift = await this.findAccessibleShift(actor, shiftId);

    if (actor.role === UserRole.EMPLOYEE) {
      if (shift.employeeId !== actor.id) {
        throw new ForbiddenException('Можно редактировать только свои смены');
      }

      const limitMinutes = this.configService.get<number | null>(
        'SHIFT_EMPLOYEE_EDIT_LIMIT_MINUTES',
      );

      if (!canEmployeeEditShift(shift, limitMinutes ?? null)) {
        throw new ForbiddenException('Срок редактирования смены истек');
      }
    }

    const departmentId =
      input.departmentId === undefined
        ? shift.departmentId
        : await this.resolveEmployeeDepartment(
            shift.employeeId,
            shift.organizationId,
            input.departmentId,
          );
    const endedAt = input.endedAt === undefined ? shift.endedAt : input.endedAt;
    const status = endedAt ? ShiftStatus.CLOSED : ShiftStatus.OPEN;
    const before = this.buildShiftSnapshot(shift);

    return this.prisma.shift.update({
      where: { id: shift.id },
      data: {
        startedAt: input.startedAt ?? shift.startedAt,
        endedAt,
        status,
        departmentId,
        comment:
          input.comment === undefined ? shift.comment : input.comment?.trim() || null,
        auditLogs: {
          create: {
            actorId: actor.id,
            before,
            after: input,
          },
        },
      },
      include: this.shiftInclude,
    });
  }

  async exportXlsx(actor: CurrentUser, filter: ShiftFilter) {
    const maxRows = this.configService.getOrThrow<number>('XLSX_EXPORT_MAX_ROWS');
    const shifts = await this.listForManager(actor, filter);

    if (shifts.length > maxRows) {
      throw new BadRequestException(`Выгрузка ограничена ${maxRows} строками`);
    }

    return this.xlsxExportService.buildShiftsWorkbook(shifts);
  }

  private async findShifts(organizationId: string | null, filter: ShiftFilter) {
    if (!organizationId) {
      throw new ForbiddenException('У пользователя нет организации');
    }

    return this.prisma.shift.findMany({
      where: {
        organizationId,
        employeeId: filter.employeeId,
        departmentId: filter.departmentId,
        startedAt: {
          gte: filter.from,
          lte: filter.to,
        },
      },
      include: this.shiftInclude,
      orderBy: { startedAt: 'desc' },
    });
  }

  private async findAccessibleShift(actor: CurrentUser, shiftId: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: this.shiftInclude,
    });

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    if (actor.role === UserRole.ADMIN) {
      return shift;
    }

    if (!actor.organizationId || actor.organizationId !== shift.organizationId) {
      throw new ForbiddenException('Смена относится к другой организации');
    }

    return shift;
  }

  private async resolveEmployeeDepartment(
    employeeId: string,
    organizationId: string,
    requestedDepartmentId?: string | null,
  ): Promise<string | null> {
    const employee = await this.prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId,
        status: UserStatus.ACTIVE,
      },
      include: {
        departments: {
          where: { department: { archivedAt: null } },
          include: { department: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Сотрудник не найден');
    }

    const departmentIds = employee.departments.map(({ departmentId }) => departmentId);

    if (requestedDepartmentId) {
      if (!departmentIds.includes(requestedDepartmentId)) {
        throw new ForbiddenException('Сотрудник не состоит в выбранном департаменте');
      }

      return requestedDepartmentId;
    }

    if (departmentIds.length === 1) {
      return departmentIds[0] ?? null;
    }

    if (departmentIds.length > 1) {
      throw new BadRequestException('Нужно выбрать департамент');
    }

    return null;
  }

  private getManagerOrganizationId(actor: CurrentUser): string {
    if (actor.role !== UserRole.ORG_MANAGER || !actor.organizationId) {
      throw new ForbiddenException('Доступно только менеджеру организации');
    }

    return actor.organizationId;
  }

  private buildShiftSnapshot(shift: {
    startedAt: Date;
    endedAt: Date | null;
    status: ShiftStatus;
    departmentId: string | null;
    comment: string | null;
  }) {
    return {
      startedAt: shift.startedAt.toISOString(),
      endedAt: shift.endedAt?.toISOString() ?? null,
      status: shift.status,
      departmentId: shift.departmentId,
      comment: shift.comment,
    };
  }

  private readonly shiftInclude = {
    employee: true,
    department: true,
  } as const;
}
