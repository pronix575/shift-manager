import { BadRequestException } from '@nestjs/common';

export function parseOptionalDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException('Дата должна быть строкой');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`Некорректная дата: ${value}`);
  }

  return date;
}
