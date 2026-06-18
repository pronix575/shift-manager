import { generateUserPassword } from 'services/core/password/passwordGenerator';
import { MultiSelectField } from 'ui/components/MultiSelectField';
import { SelectField } from 'ui/components/SelectField';
import { TextField } from 'ui/components/TextField';
import { UserPasswordField } from 'ui/components/UserPasswordField';

import { creatableUserRoleOptions } from './AdminOrganizationsPage.constants';
import {
  DepartmentOption,
  OrganizationUserForm,
} from './AdminOrganizationsPage.types';

type AdminUserFormProps = {
  departmentOptions: DepartmentOption[];
  form: OrganizationUserForm;
  passwordLabel: string;
  isPasswordRequired?: boolean;
  onChange: (patch: Partial<OrganizationUserForm>) => void;
};

export function AdminUserForm({
  departmentOptions,
  form,
  passwordLabel,
  isPasswordRequired = false,
  onChange,
}: AdminUserFormProps) {
  return (
    <>
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
        options={creatableUserRoleOptions}
        value={form.role}
        onChange={(role) =>
          onChange({ role: role as OrganizationUserForm['role'] })
        }
      />
      <MultiSelectField
        className="sm:col-span-2"
        label="Департаменты"
        options={departmentOptions}
        value={form.departmentIds}
        onChange={(departmentIds) => onChange({ departmentIds })}
      />
      <UserPasswordField
        required={isPasswordRequired}
        className="sm:col-span-2"
        label={passwordLabel}
        value={form.password}
        onChange={(password) => onChange({ password })}
        onGenerate={() => onChange({ password: generateUserPassword() })}
      />
    </>
  );
}
