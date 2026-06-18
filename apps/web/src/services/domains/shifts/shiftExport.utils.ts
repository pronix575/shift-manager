import { ShiftFilterQuery, exportShiftsRequest } from 'api/shifts.api';

export async function downloadShiftsXlsx(query: ShiftFilterQuery = {}) {
  const blob = await exportShiftsRequest(query);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'shifts.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}
