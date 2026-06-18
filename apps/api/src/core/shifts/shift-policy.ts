export type ShiftEditPolicyInput = {
  status: 'OPEN' | 'CLOSED';
  endedAt: Date | null;
};

export function canEmployeeEditShift(
  shift: ShiftEditPolicyInput,
  limitMinutes: number | null,
  now = new Date(),
): boolean {
  if (shift.status === 'OPEN') {
    return true;
  }

  if (limitMinutes === null) {
    return true;
  }

  if (!shift.endedAt) {
    return false;
  }

  const editDeadline = shift.endedAt.getTime() + limitMinutes * 60 * 1000;

  return now.getTime() <= editDeadline;
}
