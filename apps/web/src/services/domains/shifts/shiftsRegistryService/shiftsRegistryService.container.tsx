import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { downloadShiftsXlsx } from 'services/domains/shifts/shiftExport.utils';

import { shiftsRegistryService } from './shiftsRegistryService.model';
import { ShiftsRegistryPage } from './view/ShiftsRegistryPage/ShiftsRegistryPage';

export function ShiftsRegistryContainer() {
  const {
    error,
    registryPageChanged,
    registryPageStarted,
    registryQueryChanged,
    registrySubmitted,
    query,
    shiftsPage,
  } = useUnit({
    query: shiftsRegistryService.outputs.$query,
    shiftsPage: shiftsRegistryService.outputs.$shiftsPage,
    error: shiftsRegistryService.outputs.$error,
    registryPageStarted: shiftsRegistryService.inputs.pageStarted,
    registryQueryChanged: shiftsRegistryService.inputs.queryChanged,
    registrySubmitted: shiftsRegistryService.inputs.submitted,
    registryPageChanged: shiftsRegistryService.inputs.pageChanged,
  });

  useEffect(() => {
    registryPageStarted();
  }, [registryPageStarted]);

  return (
    <ShiftsRegistryPage
      error={error}
      shiftsPage={shiftsPage}
      onExport={() => void downloadShiftsXlsx(query)}
      onPageChange={registryPageChanged}
      onQueryChange={registryQueryChanged}
      onSubmit={registrySubmitted}
    />
  );
}
