import { Button } from '@heroui/react';
import { Archive } from 'lucide-react';

import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';

import { AdminModalState } from './AdminOrganizationsPage.types';

type AdminArchiveOrganizationModalProps = {
  isSubmitting: boolean;
  modal: AdminModalState;
  onArchiveOrganization: () => void;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

export function AdminArchiveOrganizationModal({
  isSubmitting,
  modal,
  onArchiveOrganization,
  onClose,
  onOpenChange,
}: AdminArchiveOrganizationModalProps) {
  return (
    <ActionModal
      isOpen={modal?.type === 'archiveOrganization'}
      title="Архивировать организацию"
      size="sm"
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            isDisabled={isSubmitting}
            variant="danger"
            onClick={onArchiveOrganization}
          >
            {isSubmitting ? <ButtonSpinner /> : <Archive size={16} />}
            Архивировать
          </Button>
        </>
      }
    >
      {modal?.type === 'archiveOrganization' && (
        <p className="text-sm text-slate-600">
          Организация «{modal.organization.name}» будет отправлена в архив.
        </p>
      )}
    </ActionModal>
  );
}
