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
 * Builds localized class-validator messages for authentication request DTOs.
 */
export const authValidationMessage =
  (key: string) =>
  (validationArguments: ValidationArguments): string =>
    t(`auth.validation.${key}`, {
      args: {
        field: validationArguments.property,
        constraint: getConstraint(validationArguments, 0),
        min: getConstraint(validationArguments, 0),
        max: getConstraint(validationArguments, 1),
      },
    });
