import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUser } from 'core/auth/current-user.types';
import {
  buildPaginatedResult,
  getPaginationRange,
  type PaginationParams,
} from 'core/pagination/pagination';
import { PrismaService } from 'core/prisma/prisma.service';
import type { Prisma } from 'generated/prisma/client';
import { OrganizationStatus, UserRole } from 'generated/prisma/enums';

export type CreateOrganizationInput = {
  name: string;
  timezone?: string;
};

export type UpdateOrganizationInput = Partial<CreateOrganizationInput>;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrganizations(pagination?: PaginationParams) {
    if (pagination) {
      const total = await this.prisma.organization.count();
      const range = getPaginationRange(pagination, total);
      const items = await this.prisma.organization.findMany({
        ...this.organizationListQuery,
        skip: range.skip,
        take: range.take,
      });

      return buildPaginatedResult(items, total, range);
    }

    return this.prisma.organization.findMany({
      ...this.organizationListQuery,
    });
  }

  async getOrganization(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: this.organizationListQuery.include,
    });

    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }

    return organization;
  }

  async createOrganization(actor: CurrentUser, input: CreateOrganizationInput) {
    this.assertAdmin(actor);

    return this.prisma.organization.create({
      data: {
        name: input.name,
        timezone: input.timezone ?? 'Europe/Moscow',
        auditLogs: {
          create: {
            actorId: actor.id,
            action: 'CREATE',
            entityType: 'Organization',
            entityId: 'pending',
            details: input,
          },
        },
      },
    });
  }

  async updateOrganization(
    actor: CurrentUser,
    organizationId: string,
    input: UpdateOrganizationInput,
  ) {
    if (actor.role !== UserRole.ADMIN && actor.organizationId !== organizationId) {
      throw new ForbiddenException('Нельзя редактировать другую организацию');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: input.name ?? organization.name,
        timezone: input.timezone ?? organization.timezone,
        auditLogs: {
          create: {
            actorId: actor.id,
            action: 'UPDATE',
            entityType: 'Organization',
            entityId: organizationId,
            details: input,
          },
        },
      },
    });
  }

  async archiveOrganization(actor: CurrentUser, organizationId: string) {
    this.assertAdmin(actor);

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: OrganizationStatus.ARCHIVED,
        archivedAt: new Date(),
        auditLogs: {
          create: {
            actorId: actor.id,
            action: 'ARCHIVE',
            entityType: 'Organization',
            entityId: organizationId,
          },
        },
      },
    });
  }

  async getOwnOrganization(actor: CurrentUser) {
    if (!actor.organizationId) {
      throw new ForbiddenException('У пользователя нет организации');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: actor.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }

    return organization;
  }

  private assertAdmin(actor: CurrentUser) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Доступно только администратору');
    }
  }

  private readonly organizationListQuery = {
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: { users: true, shifts: true, departments: true },
      },
    },
  } satisfies Prisma.OrganizationFindManyArgs;
}
