import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

import {
  formatDurationFromMilliseconds,
  getDurationMilliseconds,
} from 'core/shifts/shift-duration';

type ExportShift = {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  status: string;
  source: string;
  comment: string | null;
  employee: {
    lastName: string;
    firstName: string;
    middleName: string | null;
  };
  department: { name: string } | null;
};

@Injectable()
export class XlsxExportService {
  async buildShiftsWorkbook(shifts: ExportShift[]) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Shift Manager';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Смены');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 28 },
      { header: 'Сотрудник', key: 'employee', width: 36 },
      { header: 'Департамент', key: 'department', width: 24 },
      { header: 'Начало', key: 'startedAt', width: 22 },
      { header: 'Окончание', key: 'endedAt', width: 22 },
      { header: 'Длительность', key: 'duration', width: 16 },
      { header: 'Статус', key: 'status', width: 14 },
      { header: 'Источник', key: 'source', width: 14 },
      { header: 'Комментарий', key: 'comment', width: 40 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle' };

    shifts.forEach((shift) => {
      const duration = shift.endedAt
        ? formatDurationFromMilliseconds(
            getDurationMilliseconds(shift.startedAt, shift.endedAt),
          )
        : null;

      sheet.addRow({
        id: shift.id,
        employee: [
          shift.employee.lastName,
          shift.employee.firstName,
          shift.employee.middleName,
        ]
          .filter(Boolean)
          .join(' '),
        department: shift.department?.name ?? '',
        startedAt: shift.startedAt,
        endedAt: shift.endedAt,
        duration: duration ?? '',
        status: shift.status,
        source: shift.source,
        comment: shift.comment ?? '',
      });
    });

    sheet.getColumn('startedAt').numFmt = 'dd.mm.yyyy hh:mm';
    sheet.getColumn('endedAt').numFmt = 'dd.mm.yyyy hh:mm';
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    return workbook.xlsx.writeBuffer();
  }
}
