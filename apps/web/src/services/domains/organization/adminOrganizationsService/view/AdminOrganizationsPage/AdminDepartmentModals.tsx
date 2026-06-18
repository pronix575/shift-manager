import { Button } from '@heroui/react';
import { Archive, Pencil } from 'lucide-react';
import { FormEvent } from 'react';

import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';
import { TextField } from 'ui/components/TextField';

import { AdminModalState } from './AdminOrganizationsPage.types';

type AdminDepartmentModalsProps = {
  editDepartmentName: string;
  isArchiveDepartmentSubmitting: boolean;
  isEditDepartmentSubmitting: boolean;
  modal: AdminModalState;
  onArchiveDepartment: () => void;
  onClose: () => void;
  onEditDepartmentNameChange: (name: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateDepartment: () => void;
};

export function AdminDepartmentModals({
  editDepartmentName,
  isArchiveDepartmentSubmitting,
  isEditDepartmentSubmitting,
  modal,
  onArchiveDepartment,
  onClose,
  onEditDepartmentNameChange,
  onOpenChange,
  onUpdateDepartment,
}: AdminDepartmentModalsProps) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onUpdateDepartment();
  }

  return (
    <>
      <ActionModal
        isOpen={modal?.type === 'editDepartment'}
        title="Редактировать департамент"
        size="sm"
        onOpenChange={onOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              form="edit-department-form"
              type="submit"
              isDisabled={isEditDepartmentSubmitting}
              variant="primary"
            >
              {isEditDepartmentSubmitting ? (
                <ButtonSpinner />
              ) : (
                <Pencil size={16} />
              )}
              Сохранить
            </Button>
          </>
        }
      >
        <form
          id="edit-department-form"
          className="space-y-4"
          onSubmit={(event) => void submit(event)}
        >
          <TextField
            required
            label="Название департамента"
            value={editDepartmentName}
            onChange={(event) =>
              onEditDepartmentNameChange(event.target.value)
            }
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={modal?.type === 'archiveDepartment'}
        title="Архивировать департамент"
        size="sm"
        onOpenChange={onOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="button"
              isDisabled={isArchiveDepartmentSubmitting}
              variant="danger"
              onClick={onArchiveDepartment}
            >
              {isArchiveDepartmentSubmitting ? (
                <ButtonSpinner />
              ) : (
                <Archive size={16} />
              )}
              Архивировать
            </Button>
          </>
        }
      >
        {modal?.type === 'archiveDepartment' && (
          <p className="text-sm text-slate-600">
            Департамент «{modal.department.name}» будет отправлен в архив.
          </p>
        )}
      </ActionModal>
    </>
  );
}
