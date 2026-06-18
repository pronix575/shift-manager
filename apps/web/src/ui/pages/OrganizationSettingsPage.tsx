import { Button } from '@heroui/react';
import { Archive, Link2, Plus, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { createTelegramLinkCodeRequest } from 'api/auth.api';
import { Department, Organization } from 'api/generated/api.types';
import {
  archiveDepartmentRequest,
  createDepartmentRequest,
  getOrganizationRequest,
  listDepartmentsRequest,
  updateOrganizationRequest,
} from 'api/organization.api';
import { readApiError } from 'api/http/client';
import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { TextField } from 'ui/components/TextField';

export function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('Europe/Moscow');
  const [departmentName, setDepartmentName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [nextOrganization, nextDepartments] = await Promise.all([
      getOrganizationRequest(),
      listDepartmentsRequest(),
    ]);
    setOrganization(nextOrganization);
    setDepartments(nextDepartments);
    setName(nextOrganization.name);
    setTimezone(nextOrganization.timezone);
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  async function saveOrganization(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setOrganization(await updateOrganizationRequest({ name, timezone }));
    setMessage('Организация сохранена');
  }

  async function createDepartment(event: FormEvent) {
    event.preventDefault();
    setError(null);
    await createDepartmentRequest(departmentName);
    setDepartmentName('');
    await load();
  }

  async function createTelegramCode() {
    const code = await createTelegramLinkCodeRequest();
    setMessage(`Код Telegram: ${code.code}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-slate-950">Организация</h1>

      {message && (
        <Notice tone="success">
          {message}
        </Notice>
      )}
      {error && (
        <Notice tone="danger">
          {error}
        </Notice>
      )}

      <Panel title="Профиль">
        <form
          className="grid items-end gap-3 md:grid-cols-[1fr_220px_auto]"
          onSubmit={(event) => void saveOrganization(event)}
        >
          <TextField
            label="Название"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="Часовой пояс"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          />
          <Button type="submit" variant="primary">
            <Save size={16} />
            Сохранить
          </Button>
        </form>
        <Button
          className="mt-4"
          onClick={() => void createTelegramCode()}
          variant="secondary"
        >
          <Link2 size={16} />
          Код Telegram
        </Button>
        {organization && (
          <p className="mt-4 text-sm text-slate-500">
            Статус: {organization.status}
          </p>
        )}
      </Panel>

      <Panel title="Департаменты">
        <form
          className="mb-4 grid items-end gap-3 md:grid-cols-[1fr_auto]"
          onSubmit={(event) => void createDepartment(event)}
        >
          <TextField
            label="Название департамента"
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
          />
          <Button type="submit" variant="primary">
            <Plus size={16} />
            Добавить
          </Button>
        </form>
        <DataTable
          ariaLabel="Департаменты"
          columns={[
            {
              key: 'name',
              label: 'Название',
              isRowHeader: true,
              render: (department) => department.name,
            },
            {
              key: 'users',
              label: 'Сотрудники',
              render: (department) => department._count?.users ?? 0,
            },
            {
              key: 'actions',
              label: '',
              align: 'right',
              render: (department) => (
                <Button
                  isIconOnly
                  size="sm"
                  variant="danger-soft"
                  onClick={() =>
                    void archiveDepartmentRequest(department.id).then(() => load())
                  }
                >
                  <Archive size={14} />
                </Button>
              ),
            },
          ]}
          getRowKey={(department) => department.id}
          rows={departments}
        />
      </Panel>
    </div>
  );
}
