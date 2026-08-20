import type { ValidationArguments } from 'class-validator';
import { t } from './i18n.util';

/**
 * Builds localized class-validator messages for artwork request DTOs.
 */
export const artworkValidationMessage =
  (key: string) =>
  (validationArguments: ValidationArguments): string =>
    t(`artwork.validation.${key}`, {
      args: {
        field: validationArguments.property,
        constraint: validationArguments.constraints?.[0],
      },
    });
