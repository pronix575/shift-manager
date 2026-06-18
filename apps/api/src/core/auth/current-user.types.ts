import { UserRole } from 'generated/prisma/enums';

export type CurrentUser = {
  id: string;
  organizationId: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
};
