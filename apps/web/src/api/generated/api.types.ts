/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type UserRole = 'ADMIN' | 'ORG_MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'ARCHIVED';
export type ShiftStatus = 'OPEN' | 'CLOSED';
export type ShiftSource = 'WEB' | 'TELEGRAM' | 'MANAGER';
export type OrganizationStatus = 'ACTIVE' | 'ARCHIVED';

export type CreateAdminDto = {
  firstName: string;
  lastName: string;
  middleName?: string;
  password: string;
};

export type LoginDto = {
  login: string;
  password: string;
};

export type RefreshDto = {
  refreshToken: string;
};

export type UpdateOrganizationDto = {
  name?: string;
  timezone?: string;
};

export type DepartmentDto = {
  name: string;
};

export type CreateOrganizationUserDto = {
  firstName: string;
  lastName: string;
  middleName?: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds?: string[];
};

export type UpdateOrganizationUserDto = Partial<CreateOrganizationUserDto>;

export type OrganizationDto = {
  name: string;
  timezone?: string;
};

export type PaginationQueryDto = {
  page?: string;
  perPage?: string;
};

export type ShiftFilterQueryDto = {
  from?: string;
  to?: string;
  employeeId?: string;
  departmentId?: string;
};

export type ShiftQueryDto = ShiftFilterQueryDto & PaginationQueryDto;

export type StatsQueryDto = ShiftFilterQueryDto;

export type StartShiftDto = {
  departmentId?: string;
  comment?: string;
};

export type UpdateShiftDto = {
  startedAt?: string;
  endedAt?: string;
  departmentId?: string;
  comment?: string;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

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

export type CredentialsResponse = {
  user: OrganizationUser;
  credentials: { login: string };
};

export type LogoutResponse = {
  ok: boolean;
};

export type TelegramLinkCodeResponse = {
  code: string;
  expiresAt: string;
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

export namespace Api {
  /**
   * No description
   * @tags admins
   * @name AdminsControllerCreate
   * @request POST:/api/admins
   * @secure
   */
  export namespace AdminsControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateAdminDto;
    export type RequestHeaders = {};
    export type ResponseBody = CredentialsResponse;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerLogin
   * @request POST:/api/auth/login
   */
  export namespace AuthControllerLogin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginDto;
    export type RequestHeaders = {};
    export type ResponseBody = AuthResponse;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerRefresh
   * @request POST:/api/auth/refresh
   */
  export namespace AuthControllerRefresh {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RefreshDto;
    export type RequestHeaders = {};
    export type ResponseBody = AuthResponse;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerLogout
   * @request POST:/api/auth/logout
   */
  export namespace AuthControllerLogout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = { refreshToken?: string | null };
    export type RequestHeaders = {};
    export type ResponseBody = LogoutResponse;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerMe
   * @request GET:/api/auth/me
   * @secure
   */
  export namespace AuthControllerMe {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SessionUser;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerCreateTelegramLinkCode
   * @request POST:/api/auth/telegram/link-code
   * @secure
   */
  export namespace AuthControllerCreateTelegramLinkCode {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TelegramLinkCodeResponse;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerGetOwn
   * @request GET:/api/organization
   * @secure
   */
  export namespace OrganizationControllerGetOwn {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerUpdateOwn
   * @request PATCH:/api/organization
   * @secure
   */
  export namespace OrganizationControllerUpdateOwn {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateOrganizationDto;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerListDepartments
   * @request GET:/api/organization/departments
   * @secure
   */
  export namespace OrganizationControllerListDepartments {
    export type RequestParams = {};
    export type RequestQuery = PaginationQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Department[];
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerCreateDepartment
   * @request POST:/api/organization/departments
   * @secure
   */
  export namespace OrganizationControllerCreateDepartment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DepartmentDto;
    export type RequestHeaders = {};
    export type ResponseBody = Department;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerUpdateDepartment
   * @request PATCH:/api/organization/departments/{id}
   * @secure
   */
  export namespace OrganizationControllerUpdateDepartment {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DepartmentDto;
    export type RequestHeaders = {};
    export type ResponseBody = Department;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerArchiveDepartment
   * @request DELETE:/api/organization/departments/{id}
   * @secure
   */
  export namespace OrganizationControllerArchiveDepartment {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Department;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerListUsers
   * @request GET:/api/organization/users
   * @secure
   */
  export namespace OrganizationControllerListUsers {
    export type RequestParams = {};
    export type RequestQuery = PaginationQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OrganizationUser[];
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerCreateUser
   * @request POST:/api/organization/users
   * @secure
   */
  export namespace OrganizationControllerCreateUser {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateOrganizationUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = CredentialsResponse;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerUpdateUser
   * @request PATCH:/api/organization/users/{id}
   * @secure
   */
  export namespace OrganizationControllerUpdateUser {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateOrganizationUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = OrganizationUser;
  }

  /**
   * No description
   * @tags organization
   * @name OrganizationControllerArchiveUser
   * @request DELETE:/api/organization/users/{id}
   * @secure
   */
  export namespace OrganizationControllerArchiveUser {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OrganizationUser;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerList
   * @request GET:/api/organizations
   * @secure
   */
  export namespace OrganizationsControllerList {
    export type RequestParams = {};
    export type RequestQuery = PaginationQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Organization[];
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerGet
   * @request GET:/api/organizations/{id}
   * @secure
   */
  export namespace OrganizationsControllerGet {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerCreate
   * @request POST:/api/organizations
   * @secure
   */
  export namespace OrganizationsControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OrganizationDto;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerUpdate
   * @request PATCH:/api/organizations/{id}
   * @secure
   */
  export namespace OrganizationsControllerUpdate {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = OrganizationDto;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerArchive
   * @request POST:/api/organizations/{id}/archive
   * @secure
   */
  export namespace OrganizationsControllerArchive {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerListDepartments
   * @request GET:/api/organizations/{id}/departments
   * @secure
   */
  export namespace OrganizationsControllerListDepartments {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = PaginationQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Department[];
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerCreateDepartment
   * @request POST:/api/organizations/{id}/departments
   * @secure
   */
  export namespace OrganizationsControllerCreateDepartment {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DepartmentDto;
    export type RequestHeaders = {};
    export type ResponseBody = Department;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerUpdateDepartment
   * @request PATCH:/api/organizations/{id}/departments/{departmentId}
   * @secure
   */
  export namespace OrganizationsControllerUpdateDepartment {
    export type RequestParams = {
      id: string;
      departmentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DepartmentDto;
    export type RequestHeaders = {};
    export type ResponseBody = Department;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerArchiveDepartment
   * @request DELETE:/api/organizations/{id}/departments/{departmentId}
   * @secure
   */
  export namespace OrganizationsControllerArchiveDepartment {
    export type RequestParams = {
      id: string;
      departmentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Department;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerListUsers
   * @request GET:/api/organizations/{id}/users
   * @secure
   */
  export namespace OrganizationsControllerListUsers {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = PaginationQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OrganizationUser[];
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerCreateUser
   * @request POST:/api/organizations/{id}/users
   * @secure
   */
  export namespace OrganizationsControllerCreateUser {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CreateOrganizationUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = CredentialsResponse;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerUpdateUser
   * @request PATCH:/api/organizations/{id}/users/{userId}
   * @secure
   */
  export namespace OrganizationsControllerUpdateUser {
    export type RequestParams = {
      id: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateOrganizationUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = OrganizationUser;
  }

  /**
   * No description
   * @tags organizations
   * @name OrganizationsControllerArchiveUser
   * @request DELETE:/api/organizations/{id}/users/{userId}
   * @secure
   */
  export namespace OrganizationsControllerArchiveUser {
    export type RequestParams = {
      id: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OrganizationUser;
  }

  /**
   * No description
   * @tags shifts
   * @name ShiftsControllerList
   * @request GET:/api/shifts
   * @secure
   */
  export namespace ShiftsControllerList {
    export type RequestParams = {};
    export type RequestQuery = ShiftQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PaginatedResponse<Shift>;
  }

  /**
   * No description
   * @tags shifts
   * @name ShiftsControllerListMine
   * @request GET:/api/shifts/me
   * @secure
   */
  export namespace ShiftsControllerListMine {
    export type RequestParams = {};
    export type RequestQuery = ShiftQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PaginatedResponse<Shift>;
  }

  /**
   * No description
   * @tags shifts
   * @name ShiftsControllerStart
   * @request POST:/api/shifts/start
   * @secure
   */
  export namespace ShiftsControllerStart {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = StartShiftDto;
    export type RequestHeaders = {};
    export type ResponseBody = Shift;
  }

  /**
   * No description
   * @tags shifts
   * @name ShiftsControllerFinish
   * @request POST:/api/shifts/{id}/finish
   * @secure
   */
  export namespace ShiftsControllerFinish {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Shift;
  }

  /**
   * No description
   * @tags shifts
   * @name ShiftsControllerUpdate
   * @request PATCH:/api/shifts/{id}
   * @secure
   */
  export namespace ShiftsControllerUpdate {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateShiftDto;
    export type RequestHeaders = {};
    export type ResponseBody = Shift;
  }

  /**
   * No description
   * @tags shifts
   * @name ShiftsControllerExport
   * @request GET:/api/shifts/export.xlsx
   * @secure
   */
  export namespace ShiftsControllerExport {
    export type RequestParams = {};
    export type RequestQuery = ShiftFilterQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags stats
   * @name StatsControllerSummary
   * @request GET:/api/stats/summary
   * @secure
   */
  export namespace StatsControllerSummary {
    export type RequestParams = {};
    export type RequestQuery = StatsQueryDto;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = StatsSummary;
  }

  /**
   * No description
   * @tags telegram
   * @name TelegramControllerWebhook
   * @request POST:/api/telegram/webhook/{secret}
   */
  export namespace TelegramControllerWebhook {
    export type RequestParams = {
      secret: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
