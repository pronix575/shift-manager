import { describe, expect, it, vi } from 'vitest';

import { PrismaService } from 'core/prisma/prisma.service';

import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  it('lists active organizations before archived ones', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new OrganizationsService({
      organization: { findMany },
    } as unknown as PrismaService);

    await service.listOrganizations();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { users: true, shifts: true, departments: true },
        },
      },
    });
  });
});
