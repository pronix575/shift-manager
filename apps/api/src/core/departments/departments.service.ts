import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUser } from 'core/auth/current-user.types';
import { PrismaService } from 'core/prisma/prisma.service';
import { UserRole } from 'generated/prisma/enums';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: CurrentUser) {
    const organizationId = this.getOrganizationId(actor);

    return this.listByOrganizationId(organizationId);
  }

  async listByOrganizationId(organizationId: string) {
    return this.prisma.department.findMany({
      where: { organizationId, archivedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true, shifts: true } } },
    });
  }

  async create(actor: CurrentUser, name: string) {
    const organizationId = this.getOrganizationId(actor);

    return this.createByOrganizationId(organizationId, name);
  }

  async createByOrganizationId(organizationId: string, name: string) {
    return this.prisma.department.create({
      data: {
        organizationId,
        name: name.trim(),
      },
    });
  }

  async update(actor: CurrentUser, departmentId: string, name: string) {
    const organizationId = this.getOrganizationId(actor);
    await this.assertDepartmentInOrganization(departmentId, organizationId);

    return this.prisma.department.update({
      where: { id: departmentId },
      data: { name: name.trim() },
    });
  }

  async archive(actor: CurrentUser, departmentId: string) {
    const organizationId = this.getOrganizationId(actor);

    return this.archiveByOrganizationId(organizationId, departmentId);
  }

  async archiveByOrganizationId(organizationId: string, departmentId: string) {
    await this.assertDepartmentInOrganization(departmentId, organizationId);

    return this.prisma.department.update({
      where: { id: departmentId },
      data: { archivedAt: new Date() },
    });
  }

  async assertDepartmentsBelongToOrganization(
    departmentIds: string[],
    organizationId: string,
  ) {
    if (departmentIds.length === 0) {
      return;
    }

    const count = await this.prisma.department.count({
      where: {
        id: { in: departmentIds },
        organizationId,
        archivedAt: null,
      },
    });

    if (count !== departmentIds.length) {
      throw new ForbiddenException('Часть департаментов не относится к организации');
    }
  }

  private async assertDepartmentInOrganization(
    departmentId: string,
    organizationId: string,
  ) {
    const department = await this.prisma.department.findFirst({
      where: { id: departmentId, organizationId, archivedAt: null },
    });

    if (!department) {
      throw new NotFoundException('Департамент не найден');
    }
  }

  private getOrganizationId(actor: CurrentUser): string {
    if (actor.role !== UserRole.ORG_MANAGER || !actor.organizationId) {
      throw new ForbiddenException('Доступно только менеджеру организации');
    }

    return actor.organizationId;
  }
}
