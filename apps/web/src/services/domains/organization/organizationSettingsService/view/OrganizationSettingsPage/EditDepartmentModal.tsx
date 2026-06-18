import { Button } from '@heroui/react';
import { Pencil } from 'lucide-react';
import { FormEvent } from 'react';

import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';
import { TextField } from 'ui/components/TextField';

import { DepartmentModalState } from './OrganizationSettingsPage.types';

type EditDepartmentModalProps = {
  departmentName: string;
  isUpdating: boolean;
  modal: DepartmentModalState;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: () => void;
};

export function EditDepartmentModal({
  departmentName,
  isUpdating,
  modal,
  onClose,
  onNameChange,
  onOpenChange,
  onSubmit,
}: EditDepartmentModalProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
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
            isDisabled={isUpdating}
            variant="primary"
          >
            {isUpdating ? <ButtonSpinner /> : <Pencil size={16} />}
            Сохранить
          </Button>
        </>
      }
    >
      <form
        id="edit-department-form"
        className="space-y-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          required
          label="Название департамента"
          value={departmentName}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </form>
    </ActionModal>
  );
}
