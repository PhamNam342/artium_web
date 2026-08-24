import type { ValidationArguments } from 'class-validator';
import { t } from './i18n.util';

function getConstraint(
  validationArguments: ValidationArguments,
  index: number,
): string | number | undefined {
  const value: unknown = validationArguments.constraints?.[index];

  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined;
}

/**
 * Builds localized class-validator messages for artwork request DTOs.
 */
export const artworkValidationMessage =
  (key: string) =>
  (validationArguments: ValidationArguments): string =>
    t(`artwork.validation.${key}`, {
      args: {
        field: validationArguments.property,
        constraint: getConstraint(validationArguments, 0),
      },
    });
