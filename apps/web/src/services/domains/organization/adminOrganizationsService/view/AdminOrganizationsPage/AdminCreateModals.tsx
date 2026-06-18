import { Button } from '@heroui/react';
import { Plus, ShieldPlus } from 'lucide-react';
import { FormEvent } from 'react';

import { generateUserPassword } from 'services/core/password/passwordGenerator';
import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';
import { TextField } from 'ui/components/TextField';
import { UserPasswordField } from 'ui/components/UserPasswordField';

import {
  AdminForm,
  AdminModalState,
} from './AdminOrganizationsPage.types';

type AdminCreateModalsProps = {
  admin: AdminForm;
  departmentName: string;
  isCreateAdminSubmitting: boolean;
  isCreateDepartmentSubmitting: boolean;
  isCreateOrganizationSubmitting: boolean;
  modal: AdminModalState;
  organizationName: string;
  onAdminChange: (patch: Partial<AdminForm>) => void;
  onClose: () => void;
  onCreateAdmin: () => void;
  onCreateDepartment: () => void;
  onCreateOrganization: () => void;
  onDepartmentNameChange: (name: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onOrganizationNameChange: (name: string) => void;
};

export function AdminCreateModals({
  admin,
  departmentName,
  isCreateAdminSubmitting,
  isCreateDepartmentSubmitting,
  isCreateOrganizationSubmitting,
  modal,
  organizationName,
  onAdminChange,
  onClose,
  onCreateAdmin,
  onCreateDepartment,
  onCreateOrganization,
  onDepartmentNameChange,
  onOpenChange,
  onOrganizationNameChange,
}: AdminCreateModalsProps) {
  function submit(event: FormEvent, handler: () => void) {
    event.preventDefault();
    handler();
  }

  return (
    <>
      <ActionModal
        isOpen={modal?.type === 'createOrganization'}
        title="Создать организацию"
        size="sm"
        onOpenChange={onOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              form="create-organization-form"
              type="submit"
              isDisabled={isCreateOrganizationSubmitting}
              variant="primary"
            >
              {isCreateOrganizationSubmitting ? (
                <ButtonSpinner />
              ) : (
                <Plus size={16} />
              )}
              Создать
            </Button>
          </>
        }
      >
        <form
          id="create-organization-form"
          className="space-y-4"
          onSubmit={(event) => void submit(event, onCreateOrganization)}
        >
          <TextField
            required
            label="Название"
            value={organizationName}
            onChange={(event) => onOrganizationNameChange(event.target.value)}
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={modal?.type === 'createAdmin'}
        title="Создать админа"
        onOpenChange={onOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              form="create-admin-form"
              type="submit"
              isDisabled={isCreateAdminSubmitting}
              variant="primary"
            >
              {isCreateAdminSubmitting ? (
                <ButtonSpinner />
              ) : (
                <ShieldPlus size={16} />
              )}
              Создать
            </Button>
          </>
        }
      >
        <form
          id="create-admin-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void submit(event, onCreateAdmin)}
        >
          <TextField
            required
            label="Фамилия"
            value={admin.lastName}
            onChange={(event) => onAdminChange({ lastName: event.target.value })}
          />
          <TextField
            required
            label="Имя"
            value={admin.firstName}
            onChange={(event) =>
              onAdminChange({ firstName: event.target.value })
            }
          />
          <TextField
            className="sm:col-span-2"
            label="Отчество"
            value={admin.middleName}
            onChange={(event) =>
              onAdminChange({ middleName: event.target.value })
            }
          />
          <UserPasswordField
            required
            className="sm:col-span-2"
            label="Пароль"
            value={admin.password}
            onChange={(password) => onAdminChange({ password })}
            onGenerate={() =>
              onAdminChange({ password: generateUserPassword() })
            }
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={modal?.type === 'createDepartment'}
        title="Добавить департамент"
        size="sm"
        onOpenChange={onOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              form="create-department-form"
              type="submit"
              isDisabled={isCreateDepartmentSubmitting}
              variant="primary"
            >
              {isCreateDepartmentSubmitting ? (
                <ButtonSpinner />
              ) : (
                <Plus size={16} />
              )}
              Добавить
            </Button>
          </>
        }
      >
        <form
          id="create-department-form"
          className="space-y-4"
          onSubmit={(event) => void submit(event, onCreateDepartment)}
        >
          <TextField
            required
            label="Название департамента"
            value={departmentName}
            onChange={(event) => onDepartmentNameChange(event.target.value)}
          />
        </form>
      </ActionModal>
    </>
  );
}
