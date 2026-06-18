import { ForbiddenException, Injectable } from '@nestjs/common';

import { CurrentUser } from 'core/auth/current-user.types';
import { PrismaService } from 'core/prisma/prisma.service';
import {
  getDurationMilliseconds,
  getRoundedDurationMinutes,
} from 'core/shifts/shift-duration';
import { ShiftFilter } from 'core/shifts/shifts.service';
import { ShiftStatus, UserRole } from 'generated/prisma/enums';

type StatsBucket = {
  name: string;
  durationMs: number;
  shifts: number;
};

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(actor: CurrentUser, filter: ShiftFilter) {
    if (actor.role !== UserRole.ORG_MANAGER || !actor.organizationId) {
      throw new ForbiddenException('Доступно только менеджеру организации');
    }

    const shifts = await this.prisma.shift.findMany({
      where: {
        organizationId: actor.organizationId,
        departmentId: filter.departmentId,
        employeeId: filter.employeeId,
        startedAt: {
          gte: filter.from,
          lte: filter.to,
        },
      },
      include: {
        employee: true,
        department: true,
      },
    });

    let totalDurationMs = 0;
    const byEmployee = new Map<string, StatsBucket>();
    const byDepartment = new Map<string, StatsBucket>();

    for (const shift of shifts) {
      const durationMs = getDurationMilliseconds(
        shift.startedAt,
        shift.endedAt,
      );
      totalDurationMs += durationMs;

      const employeeName = `${shift.employee.lastName} ${shift.employee.firstName}`;
      const employeeBucket = byEmployee.get(shift.employeeId) ?? {
        name: employeeName,
        durationMs: 0,
        shifts: 0,
      };
      employeeBucket.durationMs += durationMs;
      employeeBucket.shifts += 1;
      byEmployee.set(shift.employeeId, employeeBucket);

      const departmentKey = shift.departmentId ?? 'none';
      const departmentBucket = byDepartment.get(departmentKey) ?? {
        name: shift.department?.name ?? 'Без департамента',
        durationMs: 0,
        shifts: 0,
      };
      departmentBucket.durationMs += durationMs;
      departmentBucket.shifts += 1;
      byDepartment.set(departmentKey, departmentBucket);
    }

    return {
      totalShifts: shifts.length,
      openShifts: shifts.filter((shift) => shift.status === ShiftStatus.OPEN).length,
      closedShifts: shifts.filter((shift) => shift.status === ShiftStatus.CLOSED)
        .length,
      totalHours: Number((totalDurationMs / 36e5).toFixed(2)),
      totalDurationMinutes: getRoundedDurationMinutes(totalDurationMs),
      byEmployee: Array.from(byEmployee, ([id, value]) => ({
        id,
        name: value.name,
        shifts: value.shifts,
        hours: Number((value.durationMs / 36e5).toFixed(2)),
        durationMinutes: getRoundedDurationMinutes(value.durationMs),
      })).sort((left, right) => right.durationMinutes - left.durationMinutes),
      byDepartment: Array.from(byDepartment, ([id, value]) => ({
        id,
        name: value.name,
        shifts: value.shifts,
        hours: Number((value.durationMs / 36e5).toFixed(2)),
        durationMinutes: getRoundedDurationMinutes(value.durationMs),
      })).sort((left, right) => right.durationMinutes - left.durationMinutes),
    };
  }
}
