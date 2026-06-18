import { Button } from '@heroui/react';
import { Archive } from 'lucide-react';

import { formatPersonName } from 'services/domains/shifts/shiftFormat';
import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';

import { EmployeeModalState } from './EmployeesPage.types';

type ArchiveEmployeeModalProps = {
  isSubmitting: boolean;
  modal: EmployeeModalState;
  onArchive: () => void;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

export function ArchiveEmployeeModal({
  isSubmitting,
  modal,
  onArchive,
  onClose,
  onOpenChange,
}: ArchiveEmployeeModalProps) {
  return (
    <ActionModal
      isOpen={modal?.type === 'archiveUser'}
      title="Архивировать пользователя"
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
            onClick={onArchive}
          >
            {isSubmitting ? <ButtonSpinner /> : <Archive size={16} />}
            Архивировать
          </Button>
        </>
      }
    >
      {modal?.type === 'archiveUser' && (
        <p className="text-sm text-slate-600">
          Пользователь {formatPersonName(modal.user)} будет скрыт из активного
          списка.
        </p>
      )}
    </ActionModal>
  );
}
