import { Button } from '@heroui/react';
import { Archive, Pencil, UserPlus } from 'lucide-react';
import { FormEvent } from 'react';

import { formatPersonName } from 'services/domains/shifts/shiftFormat';
import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';

import {
  AdminModalState,
  DepartmentOption,
  OrganizationUserForm,
} from './AdminOrganizationsPage.types';
import { AdminUserForm } from './AdminUserForm';

type AdminUserModalsProps = {
  departmentOptions: DepartmentOption[];
  editUserForm: OrganizationUserForm;
  isArchiveUserSubmitting: boolean;
  isCreateUserSubmitting: boolean;
  isEditUserSubmitting: boolean;
  modal: AdminModalState;
  userForm: OrganizationUserForm;
  onArchiveUser: () => void;
  onClose: () => void;
  onCreateUser: () => void;
  onEditUserChange: (patch: Partial<OrganizationUserForm>) => void;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateUser: () => void;
  onUserChange: (patch: Partial<OrganizationUserForm>) => void;
};

export function AdminUserModals({
  departmentOptions,
  editUserForm,
  isArchiveUserSubmitting,
  isCreateUserSubmitting,
  isEditUserSubmitting,
  modal,
  userForm,
  onArchiveUser,
  onClose,
  onCreateUser,
  onEditUserChange,
  onOpenChange,
  onUpdateUser,
  onUserChange,
}: AdminUserModalsProps) {
  function submit(event: FormEvent, handler: () => void) {
    event.preventDefault();
    handler();
  }

  return (
    <>
      <ActionModal
        isOpen={modal?.type === 'createUser'}
        title="Добавить пользователя"
        size="lg"
        onOpenChange={onOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              form="create-user-form"
              type="submit"
              isDisabled={isCreateUserSubmitting}
              variant="primary"
            >
              {isCreateUserSubmitting ? (
                <ButtonSpinner />
              ) : (
                <UserPlus size={16} />
              )}
              Создать
            </Button>
          </>
        }
      >
        <form
          id="create-user-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void submit(event, onCreateUser)}
        >
          <AdminUserForm
            departmentOptions={departmentOptions}
            form={userForm}
            isPasswordRequired
            passwordLabel="Пароль"
            onChange={onUserChange}
          />
        </form>
      </ActionModal>

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
              isDisabled={isEditUserSubmitting}
              variant="primary"
            >
              {isEditUserSubmitting ? <ButtonSpinner /> : <Pencil size={16} />}
              Сохранить
            </Button>
          </>
        }
      >
        <form
          id="edit-user-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void submit(event, onUpdateUser)}
        >
          <AdminUserForm
            departmentOptions={departmentOptions}
            form={editUserForm}
            passwordLabel="Новый пароль"
            onChange={onEditUserChange}
          />
        </form>
      </ActionModal>

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
              isDisabled={isArchiveUserSubmitting}
              variant="danger"
              onClick={onArchiveUser}
            >
              {isArchiveUserSubmitting ? (
                <ButtonSpinner />
              ) : (
                <Archive size={16} />
              )}
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
    </>
  );
}
