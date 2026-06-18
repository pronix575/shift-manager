import { readApiError } from 'api/http/client';

export async function toApiError(error: unknown) {
  return new Error(await readApiError(error));
}
