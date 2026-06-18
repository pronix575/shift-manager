export type UserRole = 'ADMIN' | 'ORG_MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'ARCHIVED';
export type ShiftStatus = 'OPEN' | 'CLOSED';
export type ShiftSource = 'WEB' | 'TELEGRAM' | 'MANAGER';
export type OrganizationStatus = 'ACTIVE' | 'ARCHIVED';

export type Department = {
  id: string;
  name: string;
  organizationId: string;
  archivedAt: string | null;
  _count?: {
    users: number;
    shifts: number;
  };
};

export type Organization = {
  id: string;
  name: string;
  timezone: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  _count?: {
    users: number;
    shifts: number;
    departments: number;
  };
};

export type SessionUser = {
  id: string;
  organizationId: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
  middleName: string | null;
  status: UserStatus;
  departments: Array<{ id: string; name: string }>;
  telegramLinked: boolean;
  mustChangePassword: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type OrganizationUser = {
  id: string;
  organizationId: string | null;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  middleName: string | null;
  password?: { login: string; mustChangePassword?: boolean } | null;
  telegram?: { telegramId: string; username: string | null; linkedAt: string } | null;
  departments: Array<{ department: Department }>;
};

export type Shift = {
  id: string;
  organizationId: string;
  employeeId: string;
  departmentId: string | null;
  status: ShiftStatus;
  source: ShiftSource;
  startedAt: string;
  endedAt: string | null;
  comment: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
  };
  department: { id: string; name: string } | null;
};

export type StatsSummary = {
  totalShifts: number;
  openShifts: number;
  closedShifts: number;
  totalHours: number;
  totalDurationMinutes: number;
  byEmployee: Array<{
    id: string;
    name: string;
    hours: number;
    durationMinutes: number;
    shifts: number;
  }>;
  byDepartment: Array<{
    id: string;
    name: string;
    hours: number;
    durationMinutes: number;
    shifts: number;
  }>;
};
