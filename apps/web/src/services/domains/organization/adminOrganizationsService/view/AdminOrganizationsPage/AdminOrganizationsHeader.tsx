import { Button } from '@heroui/react';
import { ArrowLeft, Plus, RefreshCcw, ShieldPlus } from 'lucide-react';

import { Organization } from 'api/generated/api.types';
import { StatusPill } from 'ui/components/StatusPill';

type AdminOrganizationsHeaderProps = {
  profileOrganization: Organization | null;
  profileOrganizationId: string | null;
  onBackToList: () => void;
  onOpenCreateAdmin: () => void;
  onOpenCreateOrganization: () => void;
  onRefresh: () => void;
};

export function AdminOrganizationsHeader({
  profileOrganization,
  profileOrganizationId,
  onBackToList,
  onOpenCreateAdmin,
  onOpenCreateOrganization,
  onRefresh,
}: AdminOrganizationsHeaderProps) {
  if (profileOrganizationId) {
    return (
      <div className="space-y-3">
        <Button className="w-fit" variant="ghost" onClick={onBackToList}>
          <ArrowLeft size={16} />
          Назад
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">
              {profileOrganization?.name ?? 'Профиль организации'}
            </h1>
            {profileOrganization && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <StatusPill
                  tone={
                    profileOrganization.status === 'ACTIVE'
                      ? 'green'
                      : 'slate'
                  }
                >
                  {profileOrganization.status === 'ACTIVE'
                    ? 'Активна'
                    : 'Архив'}
                </StatusPill>
                <span>
                  Пользователи: {profileOrganization._count?.users ?? 0}
                </span>
                <span>Смены: {profileOrganization._count?.shifts ?? 0}</span>
              </div>
            )}
          </div>
          <Button variant="secondary" onClick={onRefresh}>
            <RefreshCcw size={16} />
            Обновить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-semibold text-slate-950">Организации</h1>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onOpenCreateOrganization}>
          <Plus size={16} />
          Организация
        </Button>
        <Button variant="secondary" onClick={onOpenCreateAdmin}>
          <ShieldPlus size={16} />
          Админ
        </Button>
      </div>
    </div>
  );
}
