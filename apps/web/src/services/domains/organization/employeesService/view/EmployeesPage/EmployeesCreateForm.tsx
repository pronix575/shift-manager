import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { FormEvent } from 'react';

import { generateUserPassword } from 'services/core/password/passwordGenerator';
import { MultiSelectField } from 'ui/components/MultiSelectField';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { SelectField } from 'ui/components/SelectField';
import { TextField } from 'ui/components/TextField';
import { UserPasswordField } from 'ui/components/UserPasswordField';

import { creatableRoleOptions } from './EmployeesPage.constants';
import {
  CredentialsMessage,
  DepartmentOption,
  UserForm,
} from './EmployeesPage.types';

type EmployeesCreateFormProps = {
  credentials: CredentialsMessage;
  departmentOptions: DepartmentOption[];
  form: UserForm;
  onChange: (patch: Partial<UserForm>) => void;
  onSubmit: () => void;
};

export function EmployeesCreateForm({
  credentials,
  departmentOptions,
  form,
  onChange,
  onSubmit,
}: EmployeesCreateFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Panel title="Создать аккаунт">
      <form
        className="grid items-end gap-3 md:grid-cols-2"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Фамилия"
          value={form.lastName}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
        <TextField
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
          label="Департаменты"
          options={departmentOptions}
          value={form.departmentIds}
          onChange={(departmentIds) => onChange({ departmentIds })}
        />
        <UserPasswordField
          required
          className="md:col-span-2"
          label="Пароль"
          value={form.password}
          onChange={(password) => onChange({ password })}
          onGenerate={() => onChange({ password: generateUserPassword() })}
        />
        <Button type="submit" variant="primary">
          <Plus size={16} />
          Создать
        </Button>
      </form>
      {credentials && (
        <Notice tone="success" className="mt-4">
          {[
            credentials.login ? `Логин: ${credentials.login}.` : '',
            credentials.password ? `Пароль: ${credentials.password}` : '',
          ]
            .filter(Boolean)
            .join(' ')}
        </Notice>
      )}
    </Panel>
  );
}
