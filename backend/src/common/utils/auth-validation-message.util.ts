import type { ValidationArguments } from 'class-validator';
import { t } from './i18n.util';

/**
 * Builds localized class-validator messages for authentication request DTOs.
 */
export const authValidationMessage =
  (key: string) =>
  (validationArguments: ValidationArguments): string =>
    t(`auth.validation.${key}`, {
      args: {
        field: validationArguments.property,
        constraint: validationArguments.constraints?.[0],
        min: validationArguments.constraints?.[0],
        max: validationArguments.constraints?.[1],
      },
    });
