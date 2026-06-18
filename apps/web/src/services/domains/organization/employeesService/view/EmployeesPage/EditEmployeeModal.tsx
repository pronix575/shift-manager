import { Button } from '@heroui/react';
import { Pencil } from 'lucide-react';
import { FormEvent } from 'react';

import { generateUserPassword } from 'services/core/password/passwordGenerator';
import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';
import { MultiSelectField } from 'ui/components/MultiSelectField';
import { SelectField } from 'ui/components/SelectField';
import { TextField } from 'ui/components/TextField';
import { UserPasswordField } from 'ui/components/UserPasswordField';

import { creatableRoleOptions } from './EmployeesPage.constants';
import {
  DepartmentOption,
  EmployeeModalState,
  UserForm,
} from './EmployeesPage.types';

type EditEmployeeModalProps = {
  departmentOptions: DepartmentOption[];
  form: UserForm;
  isSubmitting: boolean;
  modal: EmployeeModalState;
  onChange: (patch: Partial<UserForm>) => void;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: () => void;
};

export function EditEmployeeModal({
  departmentOptions,
  form,
  isSubmitting,
  modal,
  onChange,
  onClose,
  onOpenChange,
  onSubmit,
}: EditEmployeeModalProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <ActionModal
      isOpen={modal?.type === 'editUser'}
      title="Редактировать пользователя"
      size="lg"
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            form="edit-user-form"
            type="submit"
            isDisabled={isSubmitting}
            variant="primary"
          >
            {isSubmitting ? <ButtonSpinner /> : <Pencil size={16} />}
            Сохранить
          </Button>
        </>
      }
    >
      <form
        id="edit-user-form"
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          required
          label="Фамилия"
          value={form.lastName}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
        <TextField
          required
          label="Имя"
          value={form.firstName}
          onChange={(event) => onChange({ firstName: event.target.value })}
        />
        <TextField
          label="Отчество"
          value={form.middleName}
          onChange={(event) => onChange({ middleName: event.target.value })}
        />
        <SelectField
          label="Роль"
          options={creatableRoleOptions}
          value={form.role}
          onChange={(role) => onChange({ role: role as UserForm['role'] })}
        />
        <MultiSelectField
          className="sm:col-span-2"
          label="Департаменты"
          options={departmentOptions}
          value={form.departmentIds}
          onChange={(departmentIds) => onChange({ departmentIds })}
        />
        <UserPasswordField
          className="sm:col-span-2"
          label="Новый пароль"
          value={form.password}
          onChange={(password) => onChange({ password })}
          onGenerate={() => onChange({ password: generateUserPassword() })}
        />
      </form>
    </ActionModal>
  );
}
