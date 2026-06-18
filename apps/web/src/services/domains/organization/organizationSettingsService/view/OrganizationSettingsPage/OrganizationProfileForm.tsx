import { Button } from '@heroui/react';
import { Save } from 'lucide-react';
import { FormEvent } from 'react';

import { Organization } from 'api/generated/api.types';
import { Panel } from 'ui/components/Panel';
import { TextField } from 'ui/components/TextField';

type OrganizationProfileFormProps = {
  name: string;
  organization: Organization | null;
  timezone: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  onTimezoneChange: (timezone: string) => void;
};

export function OrganizationProfileForm({
  name,
  organization,
  timezone,
  onNameChange,
  onSubmit,
  onTimezoneChange,
}: OrganizationProfileFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Panel title="Профиль">
      <form
        className="grid items-end gap-3 md:grid-cols-[1fr_220px_auto]"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Название"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <TextField
          label="Часовой пояс"
          value={timezone}
          onChange={(event) => onTimezoneChange(event.target.value)}
        />
        <Button type="submit" variant="primary">
          <Save size={16} />
          Сохранить
        </Button>
      </form>
      {organization && (
        <p className="mt-4 text-sm text-slate-500">
          Статус: {organization.status}
        </p>
      )}
    </Panel>
  );
}
